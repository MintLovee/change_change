'use strict';
/* 바꿀래 — 순수 위치·거리·카카오 지역명 계산 모듈 (브라우저 + Node 단위 테스트 공용) */
(function (root) {
  function roundPublicCoord(n) {
    const num = Number(n);
    return Number.isFinite(num) ? Math.round(num * 1000) / 1000 : null;
  }

  function haversineMeters(a, b, c, d) {
    if (![a, b, c, d].every(Number.isFinite)) return null;
    const R = 6371000;
    const r = Math.PI / 180;
    const x = Math.sin((c - a) * r / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin((d - b) * r / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  function formatDistance(meters) {
    if (!Number.isFinite(meters) || meters < 0) return '';
    if (meters < 100) return '100m 이내';
    if (meters < 1000) return `${Math.round(meters / 50) * 50}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  }

  function pointInRing(lng, lat, ring) {
    let ins = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) ins = !ins;
    }
    return ins;
  }

  function guAt(lat, lng, geo) {
    if (!geo || !Array.isArray(geo.features)) return null;
    for (const f of geo.features) {
      const g = f.geometry;
      const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
      for (const p of polys) if (pointInRing(lng, lat, p[0])) return f.properties.n;
    }
    return null;
  }

  function nearestStation(lat, lng, stations) {
    let best = null;
    let bestDist = Infinity;
    for (const [name, sLat, sLng] of (stations || [])) {
      const d = haversineMeters(lat, lng, sLat, sLng);
      if (d != null && d < bestDist) {
        bestDist = d;
        best = name;
      }
    }
    return { name: best, distance: bestDist };
  }

  function nearestRegionAndStation(lat, lng, cent, stations, geo, regions) {
    const st = nearestStation(lat, lng, stations);
    const gu = guAt(lat, lng, geo);
    if (gu && (!regions || regions.includes(gu))) {
      return {
        region: gu,
        dong: st.name && st.distance < 1800 ? `${st.name} 부근` : '',
        nearestStation: st.name,
        stationDist: st.distance,
        approx: true
      };
    }

    // 서울 경계 밖 대략 판정 (인천 / 경기도 / 그 외 지역)
    const inIncheon = lat >= 37.34 && lat <= 37.65 && lng >= 126.35 && lng <= 126.78;
    const inGyeonggi = lat >= 36.89 && lat <= 38.28 && lng >= 126.58 && lng <= 127.86;
    if (inIncheon) {
      return { region: '인천', dong: '', nearestStation: st.name, stationDist: st.distance, approx: true };
    }
    if (inGyeonggi) {
      return { region: '경기도', dong: '', nearestStation: st.name, stationDist: st.distance, approx: true };
    }

    // 경계 근처 서울 구 보정
    let closestGu = null;
    let closestGuDist = Infinity;
    for (const [gName, [gLat, gLng]] of Object.entries(cent || {})) {
      const d = haversineMeters(lat, lng, gLat, gLng);
      if (d != null && d < closestGuDist) {
        closestGuDist = d;
        closestGu = gName;
      }
    }
    if (closestGu && closestGuDist < 5500) {
      return {
        region: closestGu,
        dong: st.name && st.distance < 1800 ? `${st.name} 부근` : '',
        nearestStation: st.name,
        stationDist: st.distance,
        approx: true
      };
    }
    return { region: '그 외 지역', dong: '', nearestStation: st.name, stationDist: st.distance, approx: true };
  }

  function parseKakaoRegionResult(results, regions) {
    if (!Array.isArray(results) || !results.length) return null;
    const picked = results.find(r => r && r.region_type === 'H') || results.find(r => r && r.region_type === 'B') || results[0];
    if (!picked) return null;
    const r1 = String(picked.region_1depth_name || '').trim();
    const r2 = String(picked.region_2depth_name || '').trim();
    const r3 = String(picked.region_3depth_name || '').trim();
    const regList = Array.isArray(regions) ? regions : [];

    let region = '그 외 지역';
    let dong = '';

    if (r1.includes('서울') && regList.includes(r2)) {
      region = r2;
      dong = r3;
    } else if (r1.includes('경기')) {
      region = '경기도';
      dong = [r2, r3].filter(Boolean).join(' ');
    } else if (r1.includes('인천')) {
      region = '인천';
      dong = [r2, r3].filter(Boolean).join(' ');
    } else {
      region = regList.includes(r2) ? r2 : '그 외 지역';
      const shortR1 = r1.replace(/(특별시|광역시|특별자치시|특별자치도|도)$/, '');
      dong = [shortR1, r2, r3].filter(Boolean).slice(0, 2).join(' ');
    }

    const fullLabel = dong ? (region === '그 외 지역' ? dong : `${region} ${dong}`) : region;
    return { region, dong, fullLabel };
  }

  function userRegionLabel(profile, short) {
    if (!profile || !profile.region) return '동네 미설정';
    const dong = String(profile.dong || '').trim();
    if (!dong) return profile.region;
    if (short) return dong;
    if (profile.region === '그 외 지역') return dong;
    return `${profile.region} · ${dong}`;
  }

  function userCoords(profile, cent) {
    if (profile && profile.loc && Number.isFinite(profile.loc.lat) && Number.isFinite(profile.loc.lng)) {
      return { lat: profile.loc.lat, lng: profile.loc.lng, exact: !!profile.locVerified };
    }
    if (profile && profile.region && cent && cent[profile.region]) {
      return { lat: cent[profile.region][0], lng: cent[profile.region][1], exact: false };
    }
    return null;
  }

  function itemCoords(item, ownerProfile, cent) {
    if (!item) return null;
    if (item.meet && Number.isFinite(item.meet.lat) && Number.isFinite(item.meet.lng)) {
      return { lat: item.meet.lat, lng: item.meet.lng, fromMeet: true };
    }
    if (ownerProfile && ownerProfile.loc && Number.isFinite(ownerProfile.loc.lat) && Number.isFinite(ownerProfile.loc.lng)) {
      return { lat: ownerProfile.loc.lat, lng: ownerProfile.loc.lng, fromMeet: false };
    }
    const r = item.region || (ownerProfile && ownerProfile.region);
    if (r && cent && cent[r]) {
      return { lat: cent[r][0], lng: cent[r][1], fromMeet: false };
    }
    return null;
  }

  function itemDistanceMeters(item, ownerProfile, myCoords, cent) {
    if (!myCoords || !Number.isFinite(myCoords.lat) || !Number.isFinite(myCoords.lng)) return null;
    const target = itemCoords(item, ownerProfile, cent);
    if (!target) return null;
    return haversineMeters(myCoords.lat, myCoords.lng, target.lat, target.lng);
  }

  function filterAndSortItems(items, opts) {
    const {
      rangeKm = 0,
      sortBy = 'recent',
      myCoords = null,
      getOwner = () => null,
      cent = {}
    } = opts || {};

    const withDist = items.map(it => {
      const dist = itemDistanceMeters(it, getOwner(it.owner), myCoords, cent);
      return { item: it, dist };
    });

    const filtered = rangeKm > 0 && myCoords
      ? withDist.filter(entry => entry.dist != null && entry.dist <= rangeKm * 1000)
      : withDist;

    filtered.sort((a, b) => {
      if (sortBy === 'distance') {
        const da = a.dist == null ? Infinity : a.dist;
        const db = b.dist == null ? Infinity : b.dist;
        if (da !== db) return da - db;
      }
      return (b.item.createdAt || 0) - (a.item.createdAt || 0);
    });

    return filtered;
  }

  const api = {
    roundPublicCoord,
    haversineMeters,
    formatDistance,
    pointInRing,
    guAt,
    nearestStation,
    nearestRegionAndStation,
    parseKakaoRegionResult,
    userRegionLabel,
    userCoords,
    itemCoords,
    itemDistanceMeters,
    filterAndSortItems
  };

  root.BaggullaeLoc = api;
})(typeof window !== 'undefined' ? window : globalThis);
