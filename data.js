// Estructura del álbum Panini Mundial 2026
// Cada figurita tiene un código tipo "FWC 1", "LEG 3", "ARG 12"
// La cantidad por equipo es estimada (~19) ya que el álbum oficial puede variar.

const ALBUM = {
  special: {
    id: 'FWC',
    name: 'Apertura · FIFA World Cup 2026',
    icon: '🏆',
    count: 30, // logo, trofeo, mascotas, sedes, estadios, balones, posters
  },
  legends: {
    id: 'LEG',
    name: 'Leyendas del Mundial',
    icon: '⭐',
    count: 20,
  },
  // 48 selecciones clasificadas / esperadas para el Mundial 2026 (USA · CAN · MEX)
  teams: [
    // Anfitriones
    { code: 'CAN', name: 'Canadá',          flag: '🇨🇦', confed: 'CONCACAF' },
    { code: 'MEX', name: 'México',          flag: '🇲🇽', confed: 'CONCACAF' },
    { code: 'USA', name: 'Estados Unidos',  flag: '🇺🇸', confed: 'CONCACAF' },
    // CONMEBOL
    { code: 'ARG', name: 'Argentina',       flag: '🇦🇷', confed: 'CONMEBOL' },
    { code: 'BRA', name: 'Brasil',          flag: '🇧🇷', confed: 'CONMEBOL' },
    { code: 'URU', name: 'Uruguay',         flag: '🇺🇾', confed: 'CONMEBOL' },
    { code: 'COL', name: 'Colombia',        flag: '🇨🇴', confed: 'CONMEBOL' },
    { code: 'ECU', name: 'Ecuador',         flag: '🇪🇨', confed: 'CONMEBOL' },
    { code: 'PAR', name: 'Paraguay',        flag: '🇵🇾', confed: 'CONMEBOL' },
    // UEFA
    { code: 'ESP', name: 'España',          flag: '🇪🇸', confed: 'UEFA' },
    { code: 'FRA', name: 'Francia',         flag: '🇫🇷', confed: 'UEFA' },
    { code: 'ENG', name: 'Inglaterra',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confed: 'UEFA' },
    { code: 'GER', name: 'Alemania',        flag: '🇩🇪', confed: 'UEFA' },
    { code: 'POR', name: 'Portugal',        flag: '🇵🇹', confed: 'UEFA' },
    { code: 'ITA', name: 'Italia',          flag: '🇮🇹', confed: 'UEFA' },
    { code: 'NED', name: 'Países Bajos',    flag: '🇳🇱', confed: 'UEFA' },
    { code: 'BEL', name: 'Bélgica',         flag: '🇧🇪', confed: 'UEFA' },
    { code: 'CRO', name: 'Croacia',         flag: '🇭🇷', confed: 'UEFA' },
    { code: 'SUI', name: 'Suiza',           flag: '🇨🇭', confed: 'UEFA' },
    { code: 'DEN', name: 'Dinamarca',       flag: '🇩🇰', confed: 'UEFA' },
    { code: 'POL', name: 'Polonia',         flag: '🇵🇱', confed: 'UEFA' },
    { code: 'AUT', name: 'Austria',         flag: '🇦🇹', confed: 'UEFA' },
    { code: 'SRB', name: 'Serbia',          flag: '🇷🇸', confed: 'UEFA' },
    { code: 'UKR', name: 'Ucrania',         flag: '🇺🇦', confed: 'UEFA' },
    { code: 'TUR', name: 'Turquía',         flag: '🇹🇷', confed: 'UEFA' },
    { code: 'NOR', name: 'Noruega',         flag: '🇳🇴', confed: 'UEFA' },
    // CONCACAF (resto)
    { code: 'PAN', name: 'Panamá',          flag: '🇵🇦', confed: 'CONCACAF' },
    { code: 'JAM', name: 'Jamaica',         flag: '🇯🇲', confed: 'CONCACAF' },
    { code: 'CRC', name: 'Costa Rica',      flag: '🇨🇷', confed: 'CONCACAF' },
    // CONMEBOL repechaje
    { code: 'BOL', name: 'Bolivia',         flag: '🇧🇴', confed: 'CONMEBOL' },
    // AFC
    { code: 'JPN', name: 'Japón',           flag: '🇯🇵', confed: 'AFC' },
    { code: 'KOR', name: 'Corea del Sur',   flag: '🇰🇷', confed: 'AFC' },
    { code: 'IRN', name: 'Irán',            flag: '🇮🇷', confed: 'AFC' },
    { code: 'AUS', name: 'Australia',       flag: '🇦🇺', confed: 'AFC' },
    { code: 'KSA', name: 'Arabia Saudita',  flag: '🇸🇦', confed: 'AFC' },
    { code: 'IRQ', name: 'Iraq',            flag: '🇮🇶', confed: 'AFC' },
    { code: 'UZB', name: 'Uzbekistán',      flag: '🇺🇿', confed: 'AFC' },
    { code: 'JOR', name: 'Jordania',        flag: '🇯🇴', confed: 'AFC' },
    // CAF
    { code: 'MAR', name: 'Marruecos',       flag: '🇲🇦', confed: 'CAF' },
    { code: 'SEN', name: 'Senegal',         flag: '🇸🇳', confed: 'CAF' },
    { code: 'EGY', name: 'Egipto',          flag: '🇪🇬', confed: 'CAF' },
    { code: 'NGA', name: 'Nigeria',         flag: '🇳🇬', confed: 'CAF' },
    { code: 'ALG', name: 'Argelia',         flag: '🇩🇿', confed: 'CAF' },
    { code: 'TUN', name: 'Túnez',           flag: '🇹🇳', confed: 'CAF' },
    { code: 'CMR', name: 'Camerún',         flag: '🇨🇲', confed: 'CAF' },
    { code: 'GHA', name: 'Ghana',           flag: '🇬🇭', confed: 'CAF' },
    { code: 'CIV', name: 'Costa de Marfil', flag: '🇨🇮', confed: 'CAF' },
    // OFC
    { code: 'NZL', name: 'Nueva Zelanda',   flag: '🇳🇿', confed: 'OFC' },
  ],
  // Cantidad de figuritas por equipo: 1 escudo + 1 plantel + 17 jugadores = 19
  perTeam: 19,
};

// Cuenta total de figuritas
ALBUM.totalCount =
  ALBUM.special.count +
  ALBUM.legends.count +
  ALBUM.teams.length * ALBUM.perTeam;

// Mapa de códigos de equipo válidos para validar el OCR
ALBUM.teamCodes = new Set(ALBUM.teams.map(t => t.code));

// Genera la lista plana de todas las figuritas con su código y grupo.
ALBUM.allStickers = (() => {
  const list = [];
  for (let i = 1; i <= ALBUM.special.count; i++) {
    list.push({ code: `${ALBUM.special.id} ${i}`, groupId: 'FWC', num: i });
  }
  for (let i = 1; i <= ALBUM.legends.count; i++) {
    list.push({ code: `${ALBUM.legends.id} ${i}`, groupId: 'LEG', num: i });
  }
  for (const t of ALBUM.teams) {
    for (let i = 1; i <= ALBUM.perTeam; i++) {
      list.push({ code: `${t.code} ${i}`, groupId: t.code, num: i });
    }
  }
  return list;
})();

// Mapa rápido código -> sticker
ALBUM.stickerByCode = (() => {
  const m = new Map();
  for (const s of ALBUM.allStickers) m.set(s.code, s);
  return m;
})();
