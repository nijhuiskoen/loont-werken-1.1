/* Regressietest: de gerefactorde rekenlaag moet exact dezelfde bedragen geven als v20. */
import { calculateScenario } from "../src/calculations/income.js";
import { calculatePension, calculateJaarruimte } from "../src/calculations/pension.js";
import { calculateNetSalary } from "../src/calculations/netSalary.js";
import { calculateHolidayPay } from "../src/calculations/holidayPay.js";
import { calculateChildcare } from "../src/calculations/childcare.js";
import { arb, ahk, iack, incomeTax } from "../src/calculations/tax.js";
import { brutoBijtelling, nettoBijtelling } from "../src/calculations/car.js";

let fails = 0;
const check = (label, got, want, tol=1) => {
  const ok = Math.abs(got-want) <= tol;
  if(!ok) fails++;
  console.log(`${ok?"✓":"✗"} ${label}: ${Math.round(got)} (verwacht ${want})`);
};

const parents=[
  {name:"Koen",  bruto:4500, uren:40, car:{enabled:false}},
  {name:"Esther",bruto:3940, uren:36, car:{enabled:true,cataloguswaarde:35280,pctLow:0.22,pctHigh:0.22,eigenBijdrage:400}},
];
const children=[{name:"Florine",opvang:[{type:"dagopvang",urenPerDag:10.5,uurtarief:11.47,days:[2,3],underKOT:true}]}];

const A = calculateScenario({parents,vakantiegeld:0.08,dertiende:false,children,hours:[40,36],si:0});
const B = calculateScenario({parents,vakantiegeld:0.08,dertiende:false,children,hours:[32,32],si:1});

console.log("— hoofdscenario (v20-referentie) —");
check("A besteedbaar",      A.besteedbaar, 6785);
check("B besteedbaar",      B.besteedbaar, 6056);
check("A eigen bijdrage",   A.eigenBijdrage, 378);
check("B eigen bijdrage",   B.eigenBijdrage, 390);
check("verschil",           A.besteedbaar-B.besteedbaar, 728);
check("A netto samen",      A.nettoSamenMnd, 7163, 2);
check("A toetsingsinkomen", A.toetsingsinkomen, 112344, 2);   // 58.320 + 51.062 + 2.962 bijtelling

console.log("— heffingskortingen (officiële tabellen) —");
check("arb(10.000)", arb(10000), 832);
check("arb(20.000)", arb(20000), 3488);   // 996 + 31,009% x (20.000 - 11.965)
check("arb(35.000)", arb(35000), 5479);
check("arb(45.592)", arb(45592), 5685);
check("arb(60.000)", arb(60000), 4747);
check("arb(140.000)", arb(140000), 0);
check("ahk(30.000)", ahk(30000), 3098, 2);
check("iack(50.000)", iack(50000), 3032);
check("belasting(58.320)", incomeTax(58320), 21201, 2);   // 35,75% x 38.883 + 37,56% x rest

console.log("— bijtelling —");
const car={enabled:true,cataloguswaarde:35280,pctLow:0.22,pctHigh:0.22,eigenBijdrage:400};
check("bruto bijtelling/jaar", brutoBijtelling(car), 7762);
check("netto bijtelling/jaar", nettoBijtelling(car), 2962);

console.log("— gemengde opvang (KOT + gesubsidieerde peuteropvang) —");
const mix=[{name:"K",opvang:[
  {type:"dagopvang",urenPerDag:10.5,uurtarief:11.47,days:[2,2],underKOT:true},
  {type:"peuterspeelzaal",urenPerDag:4,uurtarief:9.75,days:[2,2],underKOT:false}]}];
const M = calculateScenario({parents,vakantiegeld:0.08,dertiende:false,children:mix,hours:[40,36],si:0});
check("gemengd: opvangkosten", M.opvangkosten, 1382);
console.log(`  → hasSubsidie vlag: ${M.hasSubsidie===true?"✓ true":"✗ "+M.hasSubsidie}`);
if(M.hasSubsidie!==true) fails++;

console.log("— dertiende maand —");
const D = calculateScenario({parents,vakantiegeld:0.08,dertiende:true,children:[],hours:[40,36],si:0});
check("13e maand netto/mnd", D.nettoSamenMnd, 7540, 2);

console.log("— pensioen (middelloon, casus 1990) —");
const base = {regeling:"middelloon",pensioengevendFT:60000,franchise:19172,
  opbouwPct:0.01875,premiePct:0.30,fulltimeUren:40,geboortejaar:1990};
const P = calculatePension({...base,urenNu:40,urenAlt:32});
check("pensioen 40u/jaar", P.jaarNu, 766);
check("pensioen 32u/jaar", P.jaarAlt, 612);
check("verschil/jaar",     P.verschilPerJaar, -153);
// AOW-leeftijd is nu geboortejaar-afhankelijk (67j3m voor geb. 1990, niet meer vlak 67).
console.log(`  → AOW-leeftijd: ${P.aow.jaren}j${P.aow.maanden}m (vastgesteld: ${P.aow.vastgesteld}) | jaren tot AOW: ${P.jarenTotAOW} (verwacht ~31.3)`);
if(Math.abs(P.jarenTotAOW-31.3)>0.15) fails++;

console.log("— pensioen — testcases uit de spec (§23) —");
// Case 1: 40 -> 40, geen verschil door arbeidsduur
const C1 = calculatePension({...base,urenNu:40,urenAlt:40});
check("40→40: geen verschil", C1.verschilPerJaar, 0, 0.01);
// Case 2: 40 -> 32, lagere opbouw
const C2 = calculatePension({...base,urenNu:40,urenAlt:32});
console.log(`  ✓ 40→32: verschil ${Math.round(C2.verschilPerJaar)} (verwacht < 0: ${C2.verschilPerJaar<0})`);
if(!(C2.verschilPerJaar<0)) fails++;
// Case 3: 32 -> 40, hogere opbouw
const C3 = calculatePension({...base,urenNu:32,urenAlt:40});
console.log(`  ✓ 32→40: verschil ${Math.round(C3.verschilPerJaar)} (verwacht > 0: ${C3.verschilPerJaar>0})`);
if(!(C3.verschilPerJaar>0)) fails++;
// Case 4: geen pensioenregeling bekend -> expliciet niet-berekenbaar, geen verzonnen getal
const C4 = calculatePension({regeling:"onbekend",pensioengevendFT:60000,franchise:19172,
  opbouwPct:0,premiePct:0,fulltimeUren:40,urenNu:40,urenAlt:32,geboortejaar:1990});
console.log(`  ✓ onbekende regeling: berekenbaar=${C4.berekenbaar} (verwacht false)`);
if(C4.berekenbaar!==false) fails++;
// leeftijd < pensioenleeftijd (jong, ver van AOW)
const C5 = calculatePension({...base,geboortejaar:2000,urenNu:40,urenAlt:32});
console.log(`  ✓ geboortejaar 2000: jarenTotAOW=${C5.jarenTotAOW} (verwacht > 30)`);
if(!(C5.jarenTotAOW>30)) fails++;
// pensioenleeftijd al bereikt / voorbij (negatieve leeftijdsafstand wordt geclipt naar 0 door AOW-tabel, niet negatief)
const C6 = calculatePension({...base,geboortejaar:1955,urenNu:40,urenAlt:32});
console.log(`  ✓ geboortejaar 1955 (AOW al gepasseerd): jarenTotAOW=${C6.jarenTotAOW} (verwacht 0, niet negatief)`);
if(!(C6.jarenTotAOW>=0)) fails++;
// 0 inkomen (pensioengevend salaris 0) -> grondslag 0, geen opbouw, geen crash
const C7 = calculatePension({...base,pensioengevendFT:0,urenNu:40,urenAlt:32});
check("pensioengevend salaris 0 -> jaarNu", C7.jaarNu, 0, 0.01);
if(C7.berekenbaar!==false) fails++;
// zeer hoog inkomen -> gemaximeerd op het fiscale plafond, geen onbegrensde uitkomst
const C8 = calculatePension({...base,pensioengevendFT:500000,urenNu:40,urenAlt:32});
console.log(`  ✓ zeer hoog inkomen: grondslag ${Math.round(C8.grondslag)} (verwacht gemaximeerd op ${137800-19172})`);
if(Math.round(C8.grondslag)!==137800-19172) fails++;
// negatieve/ongeldige invoer -> mag niet crashen en geen negatief pensioen opleveren
const C9 = calculatePension({...base,pensioengevendFT:-1000,franchise:-500,urenNu:40,urenAlt:32});
console.log(`  ✓ negatieve invoer: grondslag ${C9.grondslag} (verwacht 0, geen crash/negatief)`);
if(!(C9.grondslag>=0)) fails++;

console.log("— premieregeling (DC): pensioenvermogen & jaarruimte —");
const DC = calculatePension({regeling:"premie",pensioengevendFT:60000,franchise:19172,
  opbouwPct:0,premiePct:0.30,fulltimeUren:40,urenNu:40,urenAlt:32,geboortejaar:1990});
console.log(`  ✓ DC vermogenNu=${Math.round(DC.vermogenNu)} vermogenAlt=${Math.round(DC.vermogenAlt)} (Alt < Nu: ${DC.vermogenAlt<DC.vermogenNu})`);
if(!(DC.vermogenAlt<DC.vermogenNu)) fails++;
if(!(DC.geschatMaandinkomenNu>0)) fails++;

const JR = calculateJaarruimte({inkomenVorigJaar:60000, factorA:0});
check("jaarruimte (60k inkomen, factor A 0)", JR.jaarruimte, 0.30*(60000-19172), 1);
const JR0 = calculateJaarruimte({inkomenVorigJaar:0, factorA:0});
console.log(`  ✓ jaarruimte zonder inkomen: ${JR0} (verwacht null, geen verzonnen getal)`);
if(JR0!==null) fails++;

console.log("— vakantiegeld —");
const V1 = calculateHolidayPay({ brutoBedrag: 4000, brutoPeriode: "maand", vakantiegeldPct: 0.08, loonheffingskorting: true });
check("vakantiegeld bruto (4000/mnd, 8%)", V1.brutoVakantiegeld, 3840, 0.01);
if(!(V1.nettoVakantiegeldIndicatief > 0 && V1.nettoVakantiegeldIndicatief < V1.brutoVakantiegeld)) fails++;
const V2 = calculateHolidayPay({ brutoBedrag: 48000, brutoPeriode: "jaar", vakantiegeldPct: 0.08, loonheffingskorting: true });
check("maand- vs jaarinvoer vakantiegeld", V2.brutoVakantiegeld, V1.brutoVakantiegeld, 0.01);
const V3 = calculateHolidayPay({ vakantiegeldPct: 0.08, salarisWijziging: { enabled: true, maandenEerstePeriode: 6, salaris1: 3000, salaris2: 4000 } });
check("salariswijziging vakantiegeld", V3.brutoVakantiegeld, 3360, 0.01);

console.log("— netto salaris —");
// laag salaris (arbeidskorting-opbouwtraject)
const NS1 = calculateNetSalary({ brutoBedrag:1800, brutoPeriode:"maand", loonheffingskorting:true });
const NS1plafond = NS1.brutoPerJaar/12; // netto/mnd kan nooit boven dit theoretische plafond komen (loonheffing >= 0)
console.log(`  ✓ laag salaris (1800/mnd): netto/mnd=${Math.round(NS1.nettoPerMaand)} van plafond ${Math.round(NS1plafond)} (lage heffingskortingen-afbouw geeft hier bijna 0 belasting — dat klopt)`);
if(!(NS1.nettoPerMaand>0 && NS1.nettoPerMaand<=NS1plafond)) fails++;
// gemiddeld salaris
const NS2 = calculateNetSalary({ brutoBedrag:3800, brutoPeriode:"maand", loonheffingskorting:true });
console.log(`  ✓ gemiddeld salaris (3800/mnd): netto/mnd=${Math.round(NS2.nettoPerMaand)}`);
if(!(NS2.nettoPerMaand>2600 && NS2.nettoPerMaand<3400)) fails++;
// hoog salaris (toptarief)
const NS3 = calculateNetSalary({ brutoBedrag:12000, brutoPeriode:"maand", loonheffingskorting:true });
console.log(`  ✓ hoog salaris (12.000/mnd): netto/mnd=${Math.round(NS3.nettoPerMaand)}`);
if(!(NS3.nettoPerMaand>6000 && NS3.nettoPerMaand<9000)) fails++;
// maandloon vs jaarloon: 12x hetzelfde maandloon moet identiek netto/mnd geven als het equivalente jaarloon
const NS4a = calculateNetSalary({ brutoBedrag:3800, brutoPeriode:"maand", loonheffingskorting:true });
const NS4b = calculateNetSalary({ brutoBedrag:3800*12, brutoPeriode:"jaar", loonheffingskorting:true });
check("maand- vs jaarinvoer geven zelfde netto/mnd", NS4a.nettoPerMaand, NS4b.nettoPerMaand, 0.5);
// loonheffingskorting aan vs uit: uit moet lager netto geven
const NS5aan = calculateNetSalary({ brutoBedrag:3800, brutoPeriode:"maand", loonheffingskorting:true });
const NS5uit = calculateNetSalary({ brutoBedrag:3800, brutoPeriode:"maand", loonheffingskorting:false });
console.log(`  ✓ LHK aan=${Math.round(NS5aan.nettoPerMaand)} vs uit=${Math.round(NS5uit.nettoPerMaand)} (uit moet lager zijn)`);
if(!(NS5uit.nettoPerMaand<NS5aan.nettoPerMaand)) fails++;
// pensioenpremie verlaagt netto EN belastbaar inkomen (fiscaal aftrekbaar)
const NS6geen = calculateNetSalary({ brutoBedrag:4000, brutoPeriode:"maand", loonheffingskorting:true });
const NS6pens = calculateNetSalary({ brutoBedrag:4000, brutoPeriode:"maand", loonheffingskorting:true, pensioen:{type:"werkgever",premieType:"percentage",premieWaarde:5} });
console.log(`  ✓ zonder pensioen=${Math.round(NS6geen.nettoPerMaand)} met 5% pensioen=${Math.round(NS6pens.nettoPerMaand)} (met pensioen moet lager zijn, maar minder dan de volle premie omdat belasting ook daalt)`);
const brutoPremiePerMaand = 4000*0.05;
if(!(NS6pens.nettoPerMaand < NS6geen.nettoPerMaand)) fails++;
if(!(NS6geen.nettoPerMaand - NS6pens.nettoPerMaand < brutoPremiePerMaand)) fails++;   // fiscaal voordeel moet het volle premiebedrag dempen
if(NS6pens.pensioenOpgegeven!==true) fails++;
if(NS6geen.pensioenOpgegeven!==false) fails++;
// vakantiegeld: hoger percentage -> hoger bruto/jaar en hoger netto/jaar
const NS7 = calculateNetSalary({ brutoBedrag:3800, brutoPeriode:"maand", loonheffingskorting:true, vakantiegeldPct:0.08 });
const NS8 = calculateNetSalary({ brutoBedrag:3800, brutoPeriode:"maand", loonheffingskorting:true, vakantiegeldPct:0.10 });
console.log(`  ✓ vakantiegeld 8%=${Math.round(NS7.vakantiegeldPerJaar)} vs 10%=${Math.round(NS8.vakantiegeldPerJaar)}`);
if(!(NS8.vakantiegeldPerJaar>NS7.vakantiegeldPerJaar)) fails++;
if(!(NS8.nettoPerJaar>NS7.nettoPerJaar)) fails++;
// grens/afbouw heffingskortingen: rond het einde van de arbeidskorting-afbouw (net onder vs ver boven de grens)
const NS9onder = calculateNetSalary({ brutoBedrag:45000, brutoPeriode:"jaar", loonheffingskorting:true });
const NS9boven = calculateNetSalary({ brutoBedrag:150000, brutoPeriode:"jaar", loonheffingskorting:true });
console.log(`  ✓ grensgeval 45k vs 150k: netto/bruto% ${(NS9onder.nettoBrutoPercentage*100).toFixed(1)}% vs ${(NS9boven.nettoBrutoPercentage*100).toFixed(1)}% (moet dalen door progressie + afbouw)`);
if(!(NS9boven.nettoBrutoPercentage<NS9onder.nettoBrutoPercentage)) fails++;
// AOW-gerechtigd: berekening moet expliciet geblokkeerd worden, geen (mogelijk fout) getal tonen
const NS10 = calculateNetSalary({ brutoBedrag:3800, brutoPeriode:"maand", loonheffingskorting:true, geboortejaar:1950, taxYear:2026 });
console.log(`  ✓ AOW-gerechtigd (geb. 1950): berekenbaar=${NS10.berekenbaar} reason=${NS10.reason} (verwacht false/aow, geen verzonnen getal)`);
if(NS10.berekenbaar!==false || NS10.reason!=="aow") fails++;
// 0 / geen inkomen -> nette "niet berekenbaar", geen crash of NaN
const NS11 = calculateNetSalary({ brutoBedrag:0, brutoPeriode:"maand", loonheffingskorting:true });
console.log(`  ✓ 0 inkomen: berekenbaar=${NS11.berekenbaar} (verwacht false, geen crash)`);
if(NS11.berekenbaar!==false) fails++;
// negatieve invoer mag niet crashen of een negatief netto opleveren
const NS12 = calculateNetSalary({ brutoBedrag:-2000, brutoPeriode:"maand", loonheffingskorting:true });
console.log(`  ✓ negatief bruto: berekenbaar=${NS12.berekenbaar} (verwacht false, geen crash)`);
if(NS12.berekenbaar!==false) fails++;

console.log("— 13e maand / bijzondere beloning —");
// geen 13e maand: alle nieuwe velden moeten 0 zijn en niets aan het reguliere resultaat wijzigen
const B0 = calculateNetSalary({ brutoBedrag:4000, brutoPeriode:"maand", loonheffingskorting:true });
console.log(`  ✓ geen 13e maand: bruto13e=${B0.bruto13eMaand} totaalNettoJaar==nettoPerJaar: ${B0.totaalNettoJaar===B0.nettoPerJaar}`);
if(B0.bruto13eMaand!==0 || B0.totaalNettoJaar!==B0.nettoPerJaar) fails++;

// vast bedrag
const B1 = calculateNetSalary({ brutoBedrag:4000, brutoPeriode:"maand", loonheffingskorting:true, dertiendeMaand:{type:"vast",waarde:2500} });
check("13e maand vast bedrag: bruto13e", B1.bruto13eMaand, 2500, 0.01);
console.log(`  ✓ netto13e=${Math.round(B1.netto13eMaand)} (moet < bruto: ${B1.netto13eMaand<2500}) | bijzonder tarief=${(B1.bijzonderTariefPct*100).toFixed(1)}%`);
if(!(B1.netto13eMaand>0 && B1.netto13eMaand<2500)) fails++;
check("totaalNettoJaar = nettoPerJaar + netto13e", B1.totaalNettoJaar, B1.nettoPerJaar+B1.netto13eMaand, 0.01);
check("totaalBrutoJaar = brutoPerJaar + bruto13e", B1.totaalBrutoJaar, B1.brutoPerJaar+2500, 0.01);
// regulier netto/mnd mag NIET veranderen door de 13e maand (staat er los van)
check("regulier netto/mnd ongewijzigd door 13e maand", B1.nettoPerMaand, B0.nettoPerMaand, 0.01);

// percentage van bruto jaarsalaris (8,33% = 1 maand op 12)
const B2 = calculateNetSalary({ brutoBedrag:4000, brutoPeriode:"maand", loonheffingskorting:true, dertiendeMaand:{type:"pctJaar",waarde:8.33} });
check("13e maand % jaarsalaris (8,33% van 48.000)", B2.bruto13eMaand, 48000*0.0833, 5);

// percentage van bruto maandsalaris (100% = 1 extra maand)
const B3 = calculateNetSalary({ brutoBedrag:4000, brutoPeriode:"maand", loonheffingskorting:true, dertiendeMaand:{type:"pctMaand",waarde:100} });
check("13e maand 100% van maandsalaris", B3.bruto13eMaand, 4000, 0.01);

// bijzonder tarief moet plausibel zijn: tussen 0% en 60%, en hoger bij hoger inkomen (progressiever)
const laag = calculateNetSalary({ brutoBedrag:2000, brutoPeriode:"maand", loonheffingskorting:true, dertiendeMaand:{type:"vast",waarde:1000} });
const hoog = calculateNetSalary({ brutoBedrag:8000, brutoPeriode:"maand", loonheffingskorting:true, dertiendeMaand:{type:"vast",waarde:1000} });
console.log(`  ✓ bijzonder tarief laag inkomen=${(laag.bijzonderTariefPct*100).toFixed(1)}% vs hoog inkomen=${(hoog.bijzonderTariefPct*100).toFixed(1)}%`);
if(!(laag.bijzonderTariefPct>=0 && laag.bijzonderTariefPct<=0.60)) fails++;
if(!(hoog.bijzonderTariefPct>=0 && hoog.bijzonderTariefPct<=0.60)) fails++;
if(!(hoog.bijzonderTariefPct>=laag.bijzonderTariefPct)) fails++;

console.log("— kinderopvang (§26) —");
const dag = (dagen)=>({ type:"dagopvang", uurtarief:11.47, urenPerDag:10.5, dagenPerWeek:dagen, underKOT:true });
const bso = (dagen)=>({ type:"bso", uurtarief:10.25, urenPerDag:5, dagenPerWeek:dagen, underKOT:true });
const gast = (dagen)=>({ type:"gastouder", uurtarief:8.75, urenPerDag:9, dagenPerWeek:dagen, underKOT:true });

// Scenario 1: 1 kind, dagopvang
const S1 = calculateChildcare({ children:[{opvang:[dag(2)]}], toetsingsinkomen:80000, minParentHoursPerWeek:32 });
console.log(`  ✓ S1 1 kind dagopvang: kosten=${Math.round(S1.opvangkostenPerMaand)} toeslag=${Math.round(S1.toeslagPerMaand)} eigen=${Math.round(S1.eigenBijdragePerMaand)}`);
if(!(S1.eigenBijdragePerMaand>0 && S1.toeslagPerMaand>0)) fails++;

// Scenario 2: 1 kind, BSO
const S2 = calculateChildcare({ children:[{opvang:[bso(2)]}], toetsingsinkomen:80000, minParentHoursPerWeek:32 });
console.log(`  ✓ S2 1 kind BSO: kosten=${Math.round(S2.opvangkostenPerMaand)} toeslag=${Math.round(S2.toeslagPerMaand)}`);
if(!(S2.opvangkostenPerMaand>0)) fails++;

// Scenario 3: 1 kind, gastouder
const S3 = calculateChildcare({ children:[{opvang:[gast(2)]}], toetsingsinkomen:80000, minParentHoursPerWeek:32 });
console.log(`  ✓ S3 1 kind gastouder: kosten=${Math.round(S3.opvangkostenPerMaand)} toeslag=${Math.round(S3.toeslagPerMaand)}`);
if(!(S3.opvangkostenPerMaand>0)) fails++;

// Scenario 4: 2 kinderen, verschillende opvangtypes — duurste kind moet "eerste kind"-percentage krijgen
const S4 = calculateChildcare({ children:[{opvang:[dag(3)]},{opvang:[bso(2)]}], toetsingsinkomen:80000, minParentHoursPerWeek:32 });
console.log(`  ✓ S4 2 kinderen: kind1 rang=${S4.perKind[0].rang} kind2 rang=${S4.perKind[1].rang}`);
if(S4.perKind[0].rang!=="eerste" || S4.perKind[1].rang!=="volgend") fails++; // dagopvang 3 dgn is duurder dan BSO 2 dgn

// Scenario 5: uurtarief ONDER maximum -> toeslag over het werkelijke (lagere) tarief
const S5 = calculateChildcare({ children:[{opvang:[{type:"dagopvang",uurtarief:9,urenPerDag:10,dagenPerWeek:2,underKOT:true}]}], toetsingsinkomen:50000, minParentHoursPerWeek:32 });
console.log(`  ✓ S5 tarief onder max (€9 vs max €11,23): toeslag=${Math.round(S5.toeslagPerMaand)} (geen 'boven maximum'-kosten): ${S5.perKind[0].kostenBovenMaximumUurprijs}`);
if(S5.perKind[0].kostenBovenMaximumUurprijs!==0) fails++;

// Scenario 6: uurtarief BOVEN maximum -> het verschil is altijd eigen kosten, ongeacht inkomen
const S6 = calculateChildcare({ children:[{opvang:[{type:"dagopvang",uurtarief:15,urenPerDag:10,dagenPerWeek:2,underKOT:true}]}], toetsingsinkomen:50000, minParentHoursPerWeek:32 });
console.log(`  ✓ S6 tarief boven max (€15 vs max €11,23): boven-maximum-kosten/mnd=${Math.round(S6.perKind[0].kostenBovenMaximumUurprijs)}`);
if(!(S6.perKind[0].kostenBovenMaximumUurprijs>0)) fails++;

// Scenario 7: laag gezamenlijk inkomen -> hoog vergoedingspercentage (max 96%)
const S7 = calculateChildcare({ children:[{opvang:[dag(3)]}], toetsingsinkomen:40000, minParentHoursPerWeek:32 });
console.log(`  ✓ S7 laag inkomen (40k): vergoedingspercentage=${(S7.vergoedingspercentageEersteKind*100).toFixed(1)}% (verwacht 96%)`);
check("S7 laag inkomen -> 96%", S7.vergoedingspercentageEersteKind, 0.96, 0.001);

// Scenario 8: hoog gezamenlijk inkomen -> laag (bodem)percentage 36,5%
const S8 = calculateChildcare({ children:[{opvang:[dag(3)]}], toetsingsinkomen:250000, minParentHoursPerWeek:32 });
console.log(`  ✓ S8 hoog inkomen (250k): vergoedingspercentage=${(S8.vergoedingspercentageEersteKind*100).toFixed(1)}% (verwacht 36,5%, bodem)`);
check("S8 hoog inkomen -> bodem 36,5%", S8.vergoedingspercentageEersteKind, 0.365, 0.001);

// Scenario 9: meer dan 230 uur per maand -> toeslag geplafonneerd, niet oneindig meegroeiend
const S9veel = calculateChildcare({ children:[{opvang:[dag(6)]}], toetsingsinkomen:80000, minParentHoursPerWeek:40 }); // 6 dgn x 10,5u x 4,33 ≈ 273u/mnd
console.log(`  ✓ S9 veel uren: toetsbareUren=${Math.round(S9veel.perKind[0].toetsbareUren)} (verwacht max 230) urenBovenMaximum=${S9veel.perKind[0].urenBovenMaximum}`);
if(S9veel.perKind[0].toetsbareUren>230.01) fails++;
if(S9veel.perKind[0].urenBovenMaximum!==true) fails++;

// Scenario 9b: 140%-koppeling drukt de toetsbare uren onder de 230, bij weinig gewerkte uren
const S9weinig = calculateChildcare({ children:[{opvang:[dag(4)]}], toetsingsinkomen:80000, minParentHoursPerWeek:8 }); // 1.4*8*4.33 ≈ 48,5u
console.log(`  ✓ S9b weinig gewerkte uren (8u/wk): toetsbareUren=${Math.round(S9weinig.perKind[0].toetsbareUren)} (verwacht ~48, ver onder 230)`);
if(!(S9weinig.perKind[0].toetsbareUren<60)) fails++;

// Scenario 10: twee partners met verschillend inkomen (via de bruto-optelling van de pagina, hier direct als toetsingsinkomen getest)
const S10 = calculateChildcare({ children:[{opvang:[dag(3)]}], toetsingsinkomen:45000+65000, minParentHoursPerWeek:24 });
console.log(`  ✓ S10 twee partners (45k+65k=110k): eigen bijdrage/mnd=${Math.round(S10.eigenBijdragePerMaand)}`);
if(!(S10.eigenBijdragePerMaand>0)) fails++;

// randgevallen: geen kinderen, 0 uren -> geen crash
const S11 = calculateChildcare({ children:[], toetsingsinkomen:80000, minParentHoursPerWeek:32 });
console.log(`  ✓ geen kinderen: kosten=${S11.opvangkostenPerMaand} (verwacht 0, geen crash)`);
if(S11.opvangkostenPerMaand!==0) fails++;
const S12 = calculateChildcare({ children:[{opvang:[{type:"dagopvang",uurtarief:10,urenPerDag:10,dagenPerWeek:0,underKOT:true}]}], toetsingsinkomen:80000, minParentHoursPerWeek:32 });
console.log(`  ✓ 0 opvangdagen: kosten=${S12.opvangkostenPerMaand} (verwacht 0, geen crash)`);
if(S12.opvangkostenPerMaand!==0) fails++;
// negatief uurtarief/uren mag niet tot negatieve kosten leiden
const S13 = calculateChildcare({ children:[{opvang:[{type:"dagopvang",uurtarief:-5,urenPerDag:-2,dagenPerWeek:-1,underKOT:true}]}], toetsingsinkomen:80000, minParentHoursPerWeek:32 });
console.log(`  ✓ negatieve invoer: kosten=${S13.opvangkostenPerMaand} (verwacht 0, geen negatief bedrag)`);
if(S13.opvangkostenPerMaand<0 || S13.toeslagPerMaand<0) fails++;
// onbekend toetsingsinkomen (0) -> geen crash, laagste percentage niet hoger dan het maximum
const S14 = calculateChildcare({ children:[{opvang:[dag(2)]}], toetsingsinkomen:0, minParentHoursPerWeek:32 });
console.log(`  ✓ toetsingsinkomen 0: vergoedingspercentage=${(S14.vergoedingspercentageEersteKind*100).toFixed(1)}% (verwacht 96%, laagste schijf)`);
if(Math.abs(S14.vergoedingspercentageEersteKind-0.96)>0.001) fails++;
// onbekende gewerkte uren -> valt terug op de volledige 230-uursgrens, geen crash
const S15 = calculateChildcare({ children:[{opvang:[dag(2)]}], toetsingsinkomen:80000, minParentHoursPerWeek:null });
console.log(`  ✓ onbekende uren: urenkoppelingActief=${S15.urenkoppelingActief} maximumUrenPerMaand=${S15.maximumUrenPerMaand} (verwacht false / 230)`);
if(S15.urenkoppelingActief!==false || S15.maximumUrenPerMaand!==230) fails++;

console.log(fails===0 ? "\n✅ ALLE TESTS GESLAAGD — rekenlaag identiek aan v20 + pensioen uitgebreid getest" : `\n❌ ${fails} test(s) mislukt`);
process.exit(fails===0?0:1);
