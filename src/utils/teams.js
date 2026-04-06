export const TEAM_META = {
  RCB:  { name:'Royal Challengers Bengaluru', color:'#ec1c24', bg:'rgba(236,28,36,.12)'  },
  MI:   { name:'Mumbai Indians',               color:'#1a5dad', bg:'rgba(26,93,173,.12)'  },
  CSK:  { name:'Chennai Super Kings',          color:'#c9a800', bg:'rgba(201,168,0,.12)'  },
  KKR:  { name:'Kolkata Knight Riders',        color:'#7b4fa6', bg:'rgba(123,79,166,.12)' },
  SRH:  { name:'Sunrisers Hyderabad',          color:'#f7a721', bg:'rgba(247,167,33,.12)' },
  RR:   { name:'Rajasthan Royals',             color:'#e73895', bg:'rgba(231,56,149,.12)' },
  DC:   { name:'Delhi Capitals',               color:'#00aeef', bg:'rgba(0,174,239,.12)'  },
  PBKS: { name:'Punjab Kings',                 color:'#ed1b24', bg:'rgba(237,27,36,.12)'  },
  GT:   { name:'Gujarat Titans',               color:'#00bfae', bg:'rgba(0,191,174,.12)'  },
  LSG:  { name:'Lucknow Super Giants',         color:'#a72b78', bg:'rgba(167,43,120,.12)' },
};

export const getTeam = (id) => TEAM_META[id] || { name: id, color:'#6b7280', bg:'rgba(107,114,128,.12)' };

export const formatNRR = (n) => {
  const v = parseFloat(n || 0);
  return (v >= 0 ? '+' : '') + v.toFixed(3);
};

export const formatOvers = (o) => {
  if (!o && o !== 0) return '—';
  const w = Math.floor(o), b = Math.round((o - w) * 10);
  return `${w}.${b}`;
};
