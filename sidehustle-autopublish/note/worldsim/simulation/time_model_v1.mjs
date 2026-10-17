export const DAYS_PER_YEAR=365;
export const TURN_DAYS=7;
export const METEOROLOGICAL_SEASONS={
  winter:{start:336,end:59},
  spring:{start:60,end:151},
  summer:{start:152,end:243},
  autumn:{start:244,end:335}
};

export function absoluteDay(calendar){
  if(calendar?.absoluteDay!=null)return Number(calendar.absoluteDay);
  return (Number(calendar.year)-1)*DAYS_PER_YEAR+Number(calendar.dayOfYear);
}
export function yearDayFromAbsolute(abs){
  const a=Math.max(1,Math.floor(abs));
  return {
    year:Math.floor((a-1)/DAYS_PER_YEAR)+1,
    dayOfYear:((a-1)%DAYS_PER_YEAR)+1
  };
}
export function seasonFromDay(dayOfYear){
  const d=((Math.floor(dayOfYear)-1)%DAYS_PER_YEAR+DAYS_PER_YEAR)%DAYS_PER_YEAR+1;
  if(d>=336||d<=59)return'winter';
  if(d<=151)return'spring';
  if(d<=243)return'summer';
  return'autumn';
}
function seasonBounds(season,year,dayOfYear){
  if(season==='winter'){
    if(dayOfYear>=336)return{startAbs:(year-1)*365+336,endAbs:year*365+59};
    return{startAbs:(year-2)*365+336,endAbs:(year-1)*365+59};
  }
  const starts={spring:60,summer:152,autumn:244},ends={spring:151,summer:243,autumn:335};
  return{startAbs:(year-1)*365+starts[season],endAbs:(year-1)*365+ends[season]};
}
export function seasonStage(calendar){
  const abs=absoluteDay(calendar),{year,dayOfYear}=yearDayFromAbsolute(abs),season=seasonFromDay(dayOfYear);
  const b=seasonBounds(season,year,dayOfYear);
  const len=b.endAbs-b.startAbs+1,pos=abs-b.startAbs;
  const frac=Math.max(0,Math.min(0.999,pos/Math.max(1,len)));
  const stage=frac<1/3?'early':frac<2/3?'mid':'late';
  return stage+'_'+season;
}
export function daysUntilMeteorologicalWinter(dayOfYear){
  const d=((Math.floor(dayOfYear)-1)%365+365)%365+1;
  if(d>=336||d<=59)return 0;
  return 336-d;
}
export function calendarFromAbsolute(abs,turn=0){
  const {year,dayOfYear}=yearDayFromAbsolute(abs);
  const base={year,dayOfYear,absoluteDay:Math.floor(abs),turn:Number(turn),turnDays:TURN_DAYS};
  const season=seasonFromDay(dayOfYear);
  return {
    ...base,
    season,
    seasonStage:seasonStage(base),
    weekOfYear:Math.floor((dayOfYear-1)/7)+1,
    daysUntilMeteorologicalWinter:daysUntilMeteorologicalWinter(dayOfYear),
    worldDateLabel:'Y'+String(year).padStart(4,'0')+'-D'+String(dayOfYear).padStart(3,'0')
  };
}
export function normalizeCalendar(calendar){
  return calendarFromAbsolute(absoluteDay(calendar),calendar?.turn||0);
}
export function advanceCalendar(calendar,days=TURN_DAYS,nextTurn=(calendar?.turn||0)+1){
  return calendarFromAbsolute(absoluteDay(calendar)+days,nextTurn);
}
export function birthAbsoluteDayFromAge(ageYears,birthDayOfYear,epochCalendar){
  const age=Math.max(0,Math.floor(ageYears));
  const epochAbs=absoluteDay(epochCalendar);
  const {dayOfYear:epochDoy}=yearDayFromAbsolute(epochAbs);
  const b=((Math.floor(birthDayOfYear)-1)%365+365)%365+1;
  const daysSinceLastBirthday=epochDoy>=b?epochDoy-b:epochDoy+365-b;
  return epochAbs-age*365-daysSinceLastBirthday;
}
export function ageDays(citizen,calendar){
  const born=citizen?.bornAbsoluteDay;
  if(Number.isFinite(born))return Math.max(0,absoluteDay(calendar)-born);
  const b=birthAbsoluteDayFromAge(citizen?.ageYears||0,citizen?.birthDayOfYear||1,{year:1,dayOfYear:239});
  return Math.max(0,absoluteDay(calendar)-b);
}
export function ageYears(citizen,calendar){return Math.floor(ageDays(citizen,calendar)/365);}

const FOOD_ANCHORS={
  ARCUS:{winter:.82,spring:1.02,summer:1.08,autumn:.94},
  MIREA:{winter:.68,spring:1.08,summer:1.16,autumn:1.04},
  VALD:{winter:.50,spring:.72,summer:.92,autumn:.68}
};
const SEASON_MID={winter:30,spring:105,summer:198,autumn:290};
function circularDistance(a,b){
  const d=Math.abs(a-b);return Math.min(d,365-d);
}
function cyclicInterpolate(anchors,dayOfYear){
  const entries=Object.entries(SEASON_MID).map(([s,d])=>({s,d,v:anchors[s]})).sort((a,b)=>a.d-b.d);
  const d=((Number(dayOfYear)-1)%365+365)%365+1;
  let left=entries[entries.length-1],right=entries[0],dd=d;
  for(let i=0;i<entries.length-1;i++){
    if(d>=entries[i].d&&d<=entries[i+1].d){left=entries[i];right=entries[i+1];break;}
  }
  let ld=left.d,rd=right.d;
  if(right.d<left.d){rd+=365;if(dd<left.d)dd+=365;}
  const f=(dd-ld)/Math.max(1,rd-ld);
  return left.v+(right.v-left.v)*f;
}
export function seasonalFoodModifier(country,dayOfYear){
  const a=FOOD_ANCHORS[country]||FOOD_ANCHORS.ARCUS;
  return Number(cyclicInterpolate(a,dayOfYear).toFixed(3));
}

const WEATHER_ANCHORS={
  ARCUS:{
    coastalWind:{winter:58,spring:45,summer:43,autumn:61},
    rain:{winter:48,spring:55,summer:50,autumn:60}
  },
  MIREA:{
    catchmentRain:{winter:40,spring:60,summer:68,autumn:58}
  },
  VALD:{
    cold:{winter:78,spring:45,summer:22,autumn:55},
    snow:{winter:68,spring:20,summer:5,autumn:28}
  }
};
export function seasonalWeatherBaseline(country,dayOfYear){
  const src=WEATHER_ANCHORS[country];
  const out={};
  for(const [k,a] of Object.entries(src||{}))out[k]=Number(cyclicInterpolate(a,dayOfYear).toFixed(2));
  return out;
}
export function anomalyMemory(turn,halfLifeTurns=10){
  return Math.pow(.5,Math.max(0,Number(turn))/Math.max(1,halfLifeTurns));
}
export function temporalInvariant(calendar,turn){
  const n=normalizeCalendar(calendar);
  return n.turn===Number(turn)&&n.absoluteDay===239+Number(turn)*TURN_DAYS;
}
