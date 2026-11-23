'use strict';
/* 바꿀래 — 순수 위치·거리·전국 시/도/시군구·카카오 지역명 계산 모듈 (브라우저 + Node 단위 테스트 공용) */
(function (root) {
  // 전국 17개 시·도 및 시·군·구 중심 좌표 (대표 좌표 기반 거리·지도 중심용)
  const SIDO_DATA = [
    {
      name: '서울특별시', short: '서울', regionKey: null, center: [37.5665, 126.9780],
      subs: [
        ['강남구', 37.5172, 127.0473], ['강동구', 37.5301, 127.1238], ['강북구', 37.6396, 127.0257], ['강서구', 37.5509, 126.8495],
        ['관악구', 37.4784, 126.9516], ['광진구', 37.5385, 127.0823], ['구로구', 37.4954, 126.8874], ['금천구', 37.4519, 126.9020],
        ['노원구', 37.6542, 127.0568], ['도봉구', 37.6688, 127.0471], ['동대문구', 37.5744, 127.0396], ['동작구', 37.5124, 126.9393],
        ['마포구', 37.5663, 126.9016], ['서대문구', 37.5791, 126.9368], ['서초구', 37.4837, 127.0324], ['성동구', 37.5633, 127.0371],
        ['성북구', 37.5891, 127.0182], ['송파구', 37.5145, 127.1066], ['양천구', 37.5169, 126.8664], ['영등포구', 37.5264, 126.8962],
        ['용산구', 37.5326, 126.9906], ['은평구', 37.6027, 126.9291], ['종로구', 37.5730, 126.9794], ['중구', 37.5641, 126.9979],
        ['중랑구', 37.6066, 127.0927]
      ]
    },
    {
      name: '부산광역시', short: '부산', regionKey: '부산광역시', center: [35.1796, 129.0756],
      subs: [
        ['강서구', 35.2122, 128.9806], ['금정구', 35.2428, 129.0921], ['기장군', 35.2446, 129.2223], ['남구', 35.1366, 129.0844],
        ['동구', 35.1293, 129.0455], ['동래구', 35.2048, 129.0837], ['부산진구', 35.1628, 129.0531], ['북구', 35.1972, 128.9903],
        ['사상구', 35.1526, 128.9912], ['사하구', 35.1045, 128.9748], ['서구', 35.0979, 129.0244], ['수영구', 35.1456, 129.1131],
        ['연제구', 35.1765, 129.0798], ['영도구', 35.0912, 129.0680], ['중구', 35.1060, 129.0324], ['해운대구', 35.1631, 129.1635]
      ]
    },
    {
      name: '대구광역시', short: '대구', regionKey: '대구광역시', center: [35.8714, 128.6014],
      subs: [
        ['군위군', 36.2428, 128.5728], ['남구', 35.8460, 128.5977], ['달서구', 35.8299, 128.5327], ['달성군', 35.7747, 128.4313],
        ['동구', 35.8868, 128.6355], ['북구', 35.8858, 128.5829], ['서구', 35.8719, 128.5592], ['수성구', 35.8582, 128.6306],
        ['중구', 35.8694, 128.6062]
      ]
    },
    {
      name: '인천광역시', short: '인천', regionKey: '인천', center: [37.4563, 126.7052],
      subs: [
        ['강화군', 37.7465, 126.4881], ['계양구', 37.5374, 126.7377], ['남동구', 37.4472, 126.7315], ['동구', 37.4739, 126.6432],
        ['미추홀구', 37.4636, 126.6503], ['부평구', 37.5074, 126.7219], ['서구', 37.5454, 126.6760], ['연수구', 37.4102, 126.6783],
        ['옹진군', 37.4465, 126.6367], ['중구', 37.4737, 126.6215]
      ]
    },
    {
      name: '광주광역시', short: '광주', regionKey: '광주광역시', center: [35.1595, 126.8526],
      subs: [
        ['광산구', 35.1396, 126.7937], ['남구', 35.1330, 126.9024], ['동구', 35.1461, 126.9231], ['북구', 35.1741, 126.9120],
        ['서구', 35.1520, 126.8902]
      ]
    },
    {
      name: '대전광역시', short: '대전', regionKey: '대전광역시', center: [36.3504, 127.3845],
      subs: [
        ['대덕구', 36.3466, 127.4157], ['동구', 36.3120, 127.4549], ['서구', 36.3556, 127.3838], ['유성구', 36.3622, 127.3561],
        ['중구', 36.3258, 127.4214]
      ]
    },
    {
      name: '울산광역시', short: '울산', regionKey: '울산광역시', center: [35.5384, 129.3114],
      subs: [
        ['남구', 35.5438, 129.3301], ['동구', 35.5048, 129.4165], ['북구', 35.5825, 129.3612], ['울주군', 35.5222, 129.2423],
        ['중구', 35.5694, 129.3328]
      ]
    },
    {
      name: '세종특별자치시', short: '세종', regionKey: '세종특별자치시', center: [36.4801, 127.2890],
      subs: [
        ['세종시 전체', 36.4801, 127.2890], ['조치원읍', 36.6012, 127.2989], ['아름동', 36.5122, 127.2468], ['도담동', 36.5162, 127.2598],
        ['새롬동', 36.4847, 127.2508], ['보람동', 36.4777, 127.2892], ['한솔동', 36.4799, 127.2602], ['다정동', 36.4944, 127.2496]
      ]
    },
    {
      name: '경기도', short: '경기', regionKey: '경기도', center: [37.2752, 127.0095],
      subs: [
        ['가평군', 37.8315, 127.5095], ['고양시', 37.6584, 126.8320], ['과천시', 37.4292, 126.9876], ['광명시', 37.4785, 126.8644],
        ['광주시', 37.4294, 127.2551], ['구리시', 37.5943, 127.1296], ['군포시', 37.3617, 126.9352], ['김포시', 37.6152, 126.7156],
        ['남양주시', 37.6360, 127.2165], ['동두천시', 37.9035, 127.0605], ['부천시', 37.5034, 126.7660], ['성남시', 37.4200, 127.1267],
        ['수원시', 37.2636, 127.0286], ['시흥시', 37.3801, 126.8030], ['안산시', 37.3219, 126.8309], ['안성시', 37.0080, 127.2797],
        ['안양시', 37.3943, 126.9568], ['양주시', 37.7853, 127.0456], ['양평군', 37.4912, 127.4876], ['여주시', 37.2983, 127.6373],
        ['연천군', 38.0965, 127.0749], ['오산시', 37.1499, 127.0772], ['용인시', 37.2411, 127.1776], ['의왕시', 37.3449, 126.9683],
        ['의정부시', 37.7381, 127.0337], ['이천시', 37.2720, 127.4351], ['파주시', 37.7599, 126.7802], ['평택시', 36.9921, 127.1127],
        ['포천시', 37.8949, 127.2003], ['하남시', 37.5393, 127.2149], ['화성시', 37.1995, 126.8312]
      ]
    },
    {
      name: '강원특별자치도', short: '강원', regionKey: '강원특별자치도', center: [37.8854, 127.7298],
      subs: [
        ['강릉시', 37.7519, 128.8761], ['고성군', 38.3806, 128.4677], ['동해시', 37.5247, 129.1143], ['삼척시', 37.4499, 129.1653],
        ['속초시', 38.2070, 128.5918], ['양구군', 38.1099, 127.9899], ['양양군', 38.0754, 128.6190], ['영월군', 37.1837, 128.4618],
        ['원주시', 37.3422, 127.9202], ['인제군', 38.0697, 128.1704], ['정선군', 37.3806, 128.6608], ['철원군', 38.1466, 127.3133],
        ['춘천시', 37.8813, 127.7298], ['태백시', 37.1641, 128.9856], ['평창군', 37.3705, 128.3902], ['홍천군', 37.6970, 127.8887],
        ['화천군', 38.1062, 127.7082], ['횡성군', 37.4916, 127.9849]
      ]
    },
    {
      name: '충청북도', short: '충북', regionKey: '충청북도', center: [36.6357, 127.4914],
      subs: [
        ['괴산군', 36.8154, 127.7866], ['단양군', 36.9846, 128.3655], ['보은군', 36.4894, 127.7295], ['영동군', 36.1750, 127.7834],
        ['옥천군', 36.3065, 127.5714], ['음성군', 36.9403, 127.6905], ['제천시', 37.1326, 128.1910], ['증평군', 36.7853, 127.5815],
        ['진천군', 36.8554, 127.4355], ['청주시', 36.6424, 127.4890], ['충주시', 36.9910, 127.9259]
      ]
    },
    {
      name: '충청남도', short: '충남', regionKey: '충청남도', center: [36.6588, 126.6728],
      subs: [
        ['계룡시', 36.2746, 127.2486], ['공주시', 36.4466, 127.1190], ['금산군', 36.1088, 127.4882], ['논산시', 36.1872, 127.0987],
        ['당진시', 36.8898, 126.6458], ['보령시', 36.3335, 126.6129], ['부여군', 36.2757, 126.9098], ['서산시', 36.7845, 126.4503],
        ['서천군', 36.0803, 126.6915], ['아산시', 36.7898, 127.0018], ['예산군', 36.6824, 126.8482], ['천안시', 36.8151, 127.1139],
        ['청양군', 36.4590, 126.8022], ['태안군', 36.7456, 126.2979], ['홍성군', 36.6012, 126.6608]
      ]
    },
    {
      name: '전북특별자치도', short: '전북', regionKey: '전북특별자치도', center: [35.8204, 127.1088],
      subs: [
        ['고창군', 35.4358, 126.7019], ['군산시', 35.9677, 126.7366], ['김제시', 35.8036, 126.8807], ['남원시', 35.4164, 127.3905],
        ['무주군', 36.0068, 127.6608], ['부안군', 35.7316, 126.7330], ['순창군', 35.3745, 127.1376], ['완주군', 35.9048, 127.1620],
        ['익산시', 35.9483, 126.9576], ['임실군', 35.6177, 127.2890], ['장수군', 35.6473, 127.5212], ['전주시', 35.8242, 127.1480],
        ['정읍시', 35.5698, 126.8560], ['진안군', 35.7917, 127.4249]
      ]
    },
    {
      name: '전라남도', short: '전남', regionKey: '전라남도', center: [34.8161, 126.4629],
      subs: [
        ['강진군', 34.6420, 126.7672], ['고흥군', 34.6112, 127.2850], ['곡성군', 35.2820, 127.2919], ['광양시', 34.9407, 127.6959],
        ['구례군', 35.2025, 127.4627], ['나주시', 35.0160, 126.7108], ['담양군', 35.3212, 126.9882], ['목포시', 34.8118, 126.3922],
        ['무안군', 34.9905, 126.4816], ['보성군', 34.7714, 127.0801], ['순천시', 34.9506, 127.4872], ['신안군', 34.8336, 126.3512],
        ['여수시', 34.7604, 127.6622], ['영광군', 35.2772, 126.5120], ['영암군', 34.8002, 126.6968], ['완도군', 34.3110, 126.7550],
        ['장성군', 35.3019, 126.7848], ['장흥군', 34.6816, 126.9069], ['진도군', 34.4868, 126.2634], ['함평군', 35.0659, 126.5166],
        ['해남군', 34.5735, 126.5992], ['화순군', 35.0645, 126.9866]
      ]
    },
    {
      name: '경상북도', short: '경북', regionKey: '경상북도', center: [36.5760, 128.5056],
      subs: [
        ['경산시', 35.8250, 128.7414], ['경주시', 35.8562, 129.2247], ['고령군', 35.7261, 128.2630], ['구미시', 36.1195, 128.3446],
        ['김천시', 36.1398, 128.1136], ['문경시', 36.5865, 128.1868], ['봉화군', 36.8931, 128.7324], ['상주시', 36.4109, 128.1591],
        ['성주군', 35.9192, 128.2830], ['안동시', 36.5684, 128.7294], ['영덕군', 36.4151, 129.3653], ['영양군', 36.6667, 129.1124],
        ['영주시', 36.8057, 128.6240], ['영천시', 35.9733, 128.9386], ['예천군', 36.6546, 128.4552], ['울릉군', 37.4844, 130.9057],
        ['울진군', 36.9931, 129.4004], ['의성군', 36.3526, 128.6970], ['청도군', 35.6473, 128.7340], ['청송군', 36.4363, 129.0570],
        ['칠곡군', 35.9955, 128.4017], ['포항시', 36.0190, 129.3435]
      ]
    },
    {
      name: '경상남도', short: '경남', regionKey: '경상남도', center: [35.2383, 128.6922],
      subs: [
        ['거제시', 34.8806, 128.6211], ['거창군', 35.6867, 127.9095], ['고성군', 34.9733, 128.3236], ['김해시', 35.2285, 128.8894],
        ['남해군', 34.8377, 127.8925], ['밀양시', 35.5038, 128.7465], ['사천시', 35.0038, 128.0642], ['산청군', 35.4156, 127.8735],
        ['양산시', 35.3350, 129.0372], ['의령군', 35.3222, 128.2617], ['진주시', 35.1800, 128.1076], ['창녕군', 35.5446, 128.4922],
        ['창원시', 35.2280, 128.6811], ['통영시', 34.8544, 128.4332], ['하동군', 35.0672, 127.7513], ['함안군', 35.2725, 128.4064],
        ['함양군', 35.5205, 127.7252], ['합천군', 35.5666, 128.1658]
      ]
    },
    {
      name: '제주특별자치도', short: '제주', regionKey: '제주특별자치도', center: [33.4996, 126.5312],
      subs: [
        ['서귀포시', 33.2541, 126.5601], ['제주시', 33.4996, 126.5312]
      ]
    }
  ];

  const SIDO_BY_NAME = {};
  const SIDO_COORDS = {};
  const SIGUNGU_COORDS = {};
  for (const s of SIDO_DATA) {
    SIDO_BY_NAME[s.name] = s;
    SIDO_COORDS[s.name] = s.center;
    if (s.regionKey) SIDO_COORDS[s.regionKey] = s.center;
    for (const [subName, lat, lng] of s.subs) {
      SIGUNGU_COORDS[`${s.name}:${subName}`] = [lat, lng];
      if (s.regionKey) SIGUNGU_COORDS[`${s.regionKey}:${subName}`] = [lat, lng];
    }
  }

  function matchSidoName(raw) {
    const s = String(raw || '').trim();
    if (!s) return '';
    if (SIDO_BY_NAME[s]) return s;
    if (s === '인천') return '인천광역시';
    if (s === '세종' || s === '세종시') return '세종특별자치시';
    if (s === '제주' || s === '제주도') return '제주특별자치도';
    if (s.includes('서울')) return '서울특별시';
    if (s.includes('부산')) return '부산광역시';
    if (s.includes('대구')) return '대구광역시';
    if (s.includes('인천')) return '인천광역시';
    if (s.includes('광주')) return '광주광역시';
    if (s.includes('대전')) return '대전광역시';
    if (s.includes('울산')) return '울산광역시';
    if (s.includes('세종')) return '세종특별자치시';
    if (s.includes('경기')) return '경기도';
    if (s.includes('강원')) return '강원특별자치도';
    if (s.includes('충청북') || s === '충북') return '충청북도';
    if (s.includes('충청남') || s === '충남') return '충청남도';
    if (s.includes('전라북') || s.includes('전북')) return '전북특별자치도';
    if (s.includes('전라남') || s === '전남') return '전라남도';
    if (s.includes('경상북') || s === '경북') return '경상북도';
    if (s.includes('경상남') || s === '경남') return '경상남도';
    if (s.includes('제주')) return '제주특별자치도';
    return '';
  }

  function resolveRegionSelection(sidoName, sigunguName) {
    const canonSido = matchSidoName(sidoName) || '서울특별시';
    const entry = SIDO_BY_NAME[canonSido];
    const sub = entry.subs.find(x => x[0] === sigunguName) || entry.subs[0];
    const subName = sub[0];
    const loc = { lat: sub[1], lng: sub[2] };
    if (canonSido === '서울특별시') {
      return { sido: canonSido, sigungu: subName, region: subName, dong: '', loc, label: subName };
    }
    const region = entry.regionKey || canonSido;
    const dong = subName === '세종시 전체' ? '' : subName;
    const label = dong ? `${region} · ${dong}` : region;
    return { sido: canonSido, sigungu: subName, region, dong, loc, label };
  }

  function inferSidoFromProfile(region, dong, seoulList) {
    const r = String(region || '').trim();
    const d = String(dong || '').trim();
    const seoulSet = new Set(Array.isArray(seoulList) ? seoulList : SIDO_BY_NAME['서울특별시'].subs.map(x => x[0]));
    if (seoulSet.has(r)) return { sido: '서울특별시', sigungu: r };
    const canonSido = matchSidoName(r);
    if (canonSido) {
      const entry = SIDO_BY_NAME[canonSido];
      const hit = d ? entry.subs.find(x => d === x[0] || d.startsWith(x[0] + ' ') || d.includes(x[0])) : null;
      return { sido: canonSido, sigungu: hit ? hit[0] : '' };
    }
    if (d) {
      for (const entry of SIDO_DATA) {
        if (d.startsWith(entry.short + ' ') || d.includes(entry.name)) {
          const hit = entry.subs.find(x => d.includes(x[0]));
          return { sido: entry.name, sigungu: hit ? hit[0] : '' };
        }
      }
    }
    return { sido: '서울특별시', sigungu: '' };
  }

  function regionCoords(region, dong, cent) {
    if (!region) return null;
    if (cent && cent[region]) return cent[region];
    const canonSido = matchSidoName(region);
    if (canonSido) {
      const entry = SIDO_BY_NAME[canonSido];
      const d = String(dong || '').trim();
      if (d) {
        const hit = entry.subs.find(x => d === x[0] || d.startsWith(x[0] + ' ') || d.includes(x[0]));
        if (hit) return [hit[1], hit[2]];
      }
      return entry.center;
    }
    return SIDO_COORDS[region] || null;
  }

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

    // 서울 경계 밖 판정 (가장 가까운 전국 시·군·구 매핑)
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

    // 전국 시·도 / 시·군·구 최단 좌표 매핑
    let bestSido = null;
    let bestSub = '';
    let bestNationDist = Infinity;
    for (const s of SIDO_DATA) {
      if (s.name === '서울특별시') continue;
      for (const [subName, sLat, sLng] of s.subs) {
        const d = haversineMeters(lat, lng, sLat, sLng);
        if (d != null && d < bestNationDist) {
          bestNationDist = d;
          bestSido = s.regionKey || s.name;
          bestSub = subName === '세종시 전체' ? '' : subName;
        }
      }
    }
    if (bestSido && bestNationDist < 120000) {
      return { region: bestSido, dong: bestSub, nearestStation: st.name, stationDist: st.distance, approx: true };
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
      const matchedSido = matchSidoName(r1);
      if (matchedSido) {
        const entry = SIDO_BY_NAME[matchedSido];
        region = entry.regionKey || matchedSido;
        dong = [r2, r3].filter(Boolean).join(' ');
      } else {
        region = regList.includes(r2) ? r2 : '그 외 지역';
        const shortR1 = r1.replace(/(특별시|광역시|특별자치시|특별자치도|도)$/, '');
        dong = [shortR1, r2, r3].filter(Boolean).slice(0, 2).join(' ');
      }
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
    if (profile && profile.region) {
      const c = regionCoords(profile.region, profile.dong, cent);
      if (c) return { lat: c[0], lng: c[1], exact: false };
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
    const d = (ownerProfile && ownerProfile.dong) || '';
    const c = regionCoords(r, d, cent);
    if (c) return { lat: c[0], lng: c[1], fromMeet: false };
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
    SIDO_DATA,
    SIDO_BY_NAME,
    SIDO_COORDS,
    SIGUNGU_COORDS,
    matchSidoName,
    resolveRegionSelection,
    inferSidoFromProfile,
    regionCoords,
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
