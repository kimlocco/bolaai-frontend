import { useState, useEffect, useRef, useCallback } from "react";

const BACKEND_URL = "https://web-production-c006e.up.railway.app";

const TEAMS = [
  // ═══ ENGLAND ═══
  { slug:"manchester-city", name:"Manchester City", league:"Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"arsenal", name:"Arsenal", league:"Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"liverpool", name:"Liverpool", league:"Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"chelsea", name:"Chelsea", league:"Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"tottenham", name:"Tottenham", league:"Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"manchester-united", name:"Man United", league:"Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"newcastle", name:"Newcastle United", league:"Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"aston-villa", name:"Aston Villa", league:"Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"west-ham", name:"West Ham", league:"Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"brighton", name:"Brighton", league:"Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"fulham", name:"Fulham", league:"Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"brentford", name:"Brentford", league:"Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"crystal-palace", name:"Crystal Palace", league:"Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"everton", name:"Everton", league:"Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"nottm-forest", name:"Nottm Forest", league:"Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"bournemouth", name:"Bournemouth", league:"Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"wolverhampton", name:"Wolverhampton", league:"Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"leicester", name:"Leicester City", league:"Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"ipswich", name:"Ipswich Town", league:"Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"southampton", name:"Southampton", league:"Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"leeds", name:"Leeds United", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"sunderland", name:"Sunderland", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"sheffield-united", name:"Sheffield United", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"burnley", name:"Burnley", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"middlesbrough", name:"Middlesbrough", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"coventry", name:"Coventry City", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"norwich", name:"Norwich City", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"bristol-city", name:"Bristol City", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"cardiff", name:"Cardiff City", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"millwall", name:"Millwall", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"hull", name:"Hull City", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"blackburn", name:"Blackburn Rovers", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"watford", name:"Watford", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"west-brom", name:"West Brom", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"stoke", name:"Stoke City", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"swansea", name:"Swansea City", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"derby", name:"Derby County", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"plymouth", name:"Plymouth Argyle", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"luton", name:"Luton Town", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"oxford", name:"Oxford United", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"preston", name:"Preston North End", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"sheffield-wednesday", name:"Sheffield Wednesday", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"qpr", name:"QPR", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"portsmouth", name:"Portsmouth", league:"Championship 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"birmingham", name:"Birmingham City", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"wrexham", name:"Wrexham", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"stockport", name:"Stockport County", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"huddersfield", name:"Huddersfield Town", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"rotherham", name:"Rotherham United", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"barnsley", name:"Barnsley", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"charlton", name:"Charlton Athletic", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"wigan", name:"Wigan Athletic", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"bolton", name:"Bolton Wanderers", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"blackpool", name:"Blackpool", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"exeter", name:"Exeter City", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"peterborough", name:"Peterborough United", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"reading", name:"Reading", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"stevenage", name:"Stevenage", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"burton", name:"Burton Albion", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"shrewsbury", name:"Shrewsbury Town", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"cambridge", name:"Cambridge United", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"northampton", name:"Northampton Town", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"leyton-orient", name:"Leyton Orient", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"lincoln", name:"Lincoln City", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"bristol-rovers", name:"Bristol Rovers", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"wycombe", name:"Wycombe Wanderers", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"crawley", name:"Crawley Town", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"mansfield", name:"Mansfield Town", league:"League One 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"chesterfield", name:"Chesterfield", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"notts-county", name:"Notts County", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"grimsby", name:"Grimsby Town", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"gillingham", name:"Gillingham", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"bradford", name:"Bradford City", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"swindon", name:"Swindon Town", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"newport", name:"Newport County", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"harrogate", name:"Harrogate Town", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"colchester", name:"Colchester United", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"tranmere", name:"Tranmere Rovers", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"doncaster", name:"Doncaster Rovers", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"walsall", name:"Walsall", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"crewe", name:"Crewe Alexandra", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"morecambe", name:"Morecambe", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"port-vale", name:"Port Vale", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"salford", name:"Salford City", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"accrington", name:"Accrington Stanley", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"fleetwood", name:"Fleetwood Town", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"carlisle", name:"Carlisle United", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"AFC-wimbledon", name:"AFC Wimbledon", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"rochdale", name:"Rochdale", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"sutton", name:"Sutton United", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"barrow", name:"Barrow", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug:"forest-green", name:"Forest Green Rovers", league:"League Two 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  // ═══ GERMANY ═══
  { slug:"bayern", name:"Bayern Munich", league:"Bundesliga 🇩🇪" },
  { slug:"dortmund", name:"Borussia Dortmund", league:"Bundesliga 🇩🇪" },
  { slug:"leverkusen", name:"Bayer Leverkusen", league:"Bundesliga 🇩🇪" },
  { slug:"leipzig", name:"RB Leipzig", league:"Bundesliga 🇩🇪" },
  { slug:"frankfurt", name:"Eintracht Frankfurt", league:"Bundesliga 🇩🇪" },
  { slug:"stuttgart", name:"VfB Stuttgart", league:"Bundesliga 🇩🇪" },
  { slug:"freiburg", name:"SC Freiburg", league:"Bundesliga 🇩🇪" },
  { slug:"mainz", name:"FSV Mainz 05", league:"Bundesliga 🇩🇪" },
  { slug:"hoffenheim", name:"Hoffenheim", league:"Bundesliga 🇩🇪" },
  { slug:"wolfsburg", name:"Wolfsburg", league:"Bundesliga 🇩🇪" },
  { slug:"werder-bremen", name:"Werder Bremen", league:"Bundesliga 🇩🇪" },
  { slug:"monchengladbach", name:"Borussia M'gladbach", league:"Bundesliga 🇩🇪" },
  { slug:"augsburg", name:"FC Augsburg", league:"Bundesliga 🇩🇪" },
  { slug:"heidenheim", name:"FC Heidenheim", league:"Bundesliga 🇩🇪" },
  { slug:"bochum", name:"VfL Bochum", league:"Bundesliga 🇩🇪" },
  { slug:"union-berlin", name:"Union Berlin", league:"Bundesliga 🇩🇪" },
  { slug:"st-pauli", name:"FC St. Pauli", league:"Bundesliga 🇩🇪" },
  { slug:"holstein-kiel", name:"Holstein Kiel", league:"Bundesliga 🇩🇪" },
  { slug:"hamburger-sv", name:"Hamburger SV", league:"Bundesliga 2 🇩🇪" },
  { slug:"hannover", name:"Hannover 96", league:"Bundesliga 2 🇩🇪" },
  { slug:"schalke", name:"Schalke 04", league:"Bundesliga 2 🇩🇪" },
  { slug:"hertha", name:"Hertha Berlin", league:"Bundesliga 2 🇩🇪" },
  { slug:"kaiserslautern", name:"Kaiserslautern", league:"Bundesliga 2 🇩🇪" },
  { slug:"karlsruher", name:"Karlsruher SC", league:"Bundesliga 2 🇩🇪" },
  { slug:"fortuna-dusseldorf", name:"Fortuna Düsseldorf", league:"Bundesliga 2 🇩🇪" },
  { slug:"greuther-furth", name:"Greuther Fürth", league:"Bundesliga 2 🇩🇪" },
  { slug:"paderborn", name:"SC Paderborn", league:"Bundesliga 2 🇩🇪" },
  { slug:"magdeburg", name:"1. FC Magdeburg", league:"Bundesliga 2 🇩🇪" },
  { slug:"braunschweig", name:"Eintracht Braunschweig", league:"Bundesliga 2 🇩🇪" },
  { slug:"elversberg", name:"SV Elversberg", league:"Bundesliga 2 🇩🇪" },
  { slug:"nurnberg", name:"1. FC Nürnberg", league:"Bundesliga 2 🇩🇪" },
  { slug:"preussen-munster", name:"Preußen Münster", league:"Bundesliga 2 🇩🇪" },
  { slug:"ulm", name:"SSV Ulm 1846", league:"Bundesliga 2 🇩🇪" },
  { slug:"regensburg", name:"Jahn Regensburg", league:"Bundesliga 2 🇩🇪" },
  { slug:"darmstadt", name:"Darmstadt 98", league:"Bundesliga 2 🇩🇪" },
  { slug:"dynamo-dresden", name:"Dynamo Dresden", league:"Bundesliga 2 🇩🇪" },
  // ═══ SPAIN ═══
  { slug:"real-madrid", name:"Real Madrid", league:"La Liga 🇪🇸" },
  { slug:"barcelona", name:"Barcelona", league:"La Liga 🇪🇸" },
  { slug:"atletico", name:"Atletico Madrid", league:"La Liga 🇪🇸" },
  { slug:"real-sociedad", name:"Real Sociedad", league:"La Liga 🇪🇸" },
  { slug:"athletic-bilbao", name:"Athletic Bilbao", league:"La Liga 🇪🇸" },
  { slug:"villarreal", name:"Villarreal", league:"La Liga 🇪🇸" },
  { slug:"real-betis", name:"Real Betis", league:"La Liga 🇪🇸" },
  { slug:"sevilla", name:"Sevilla", league:"La Liga 🇪🇸" },
  { slug:"valencia", name:"Valencia", league:"La Liga 🇪🇸" },
  { slug:"osasuna", name:"Osasuna", league:"La Liga 🇪🇸" },
  { slug:"celta-vigo", name:"Celta Vigo", league:"La Liga 🇪🇸" },
  { slug:"getafe", name:"Getafe", league:"La Liga 🇪🇸" },
  { slug:"mallorca", name:"Mallorca", league:"La Liga 🇪🇸" },
  { slug:"girona", name:"Girona", league:"La Liga 🇪🇸" },
  { slug:"alaves", name:"Deportivo Alaves", league:"La Liga 🇪🇸" },
  { slug:"rayo-vallecano", name:"Rayo Vallecano", league:"La Liga 🇪🇸" },
  { slug:"espanyol", name:"Espanyol", league:"La Liga 🇪🇸" },
  { slug:"leganes", name:"Leganes", league:"La Liga 🇪🇸" },
  { slug:"las-palmas", name:"Las Palmas", league:"La Liga 🇪🇸" },
  { slug:"valladolid", name:"Valladolid", league:"La Liga 🇪🇸" },
  { slug:"racing-santander", name:"Racing Santander", league:"Segunda 🇪🇸" },
  { slug:"sporting-gijon", name:"Sporting Gijón", league:"Segunda 🇪🇸" },
  { slug:"real-oviedo", name:"Real Oviedo", league:"Segunda 🇪🇸" },
  { slug:"sd-huesca", name:"SD Huesca", league:"Segunda 🇪🇸" },
  { slug:"real-zaragoza", name:"Real Zaragoza", league:"Segunda 🇪🇸" },
  { slug:"albacete", name:"Albacete", league:"Segunda 🇪🇸" },
  { slug:"elche", name:"Elche", league:"Segunda 🇪🇸" },
  { slug:"sd-eibar", name:"SD Eibar", league:"Segunda 🇪🇸" },
  { slug:"tenerife", name:"CD Tenerife", league:"Segunda 🇪🇸" },
  { slug:"levante", name:"Levante", league:"Segunda 🇪🇸" },
  { slug:"granada", name:"Granada", league:"Segunda 🇪🇸" },
  { slug:"cadiz", name:"Cádiz", league:"Segunda 🇪🇸" },
  { slug:"burgos", name:"Burgos CF", league:"Segunda 🇪🇸" },
  { slug:"mirandes", name:"CD Mirandés", league:"Segunda 🇪🇸" },
  { slug:"ferrol", name:"Racing Ferrol", league:"Segunda 🇪🇸" },
  { slug:"cordoba", name:"Córdoba CF", league:"Segunda 🇪🇸" },
  { slug:"eldense", name:"Eldense", league:"Segunda 🇪🇸" },
  { slug:"cartagena", name:"FC Cartagena", league:"Segunda 🇪🇸" },
  { slug:"castellon", name:"CD Castellón", league:"Segunda 🇪🇸" },
  { slug:"almeria", name:"UD Almería", league:"Segunda 🇪🇸" },
  { slug:"real-murcia", name:"Real Murcia", league:"Segunda 🇪🇸" },
  { slug:"hercules", name:"Hércules CF", league:"Segunda 🇪🇸" },
  // ═══ ITALY ═══
  { slug:"inter", name:"Inter Milan", league:"Serie A 🇮🇹" },
  { slug:"milan", name:"AC Milan", league:"Serie A 🇮🇹" },
  { slug:"juventus", name:"Juventus", league:"Serie A 🇮🇹" },
  { slug:"napoli", name:"Napoli", league:"Serie A 🇮🇹" },
  { slug:"roma", name:"AS Roma", league:"Serie A 🇮🇹" },
  { slug:"lazio", name:"Lazio", league:"Serie A 🇮🇹" },
  { slug:"atalanta", name:"Atalanta", league:"Serie A 🇮🇹" },
  { slug:"fiorentina", name:"Fiorentina", league:"Serie A 🇮🇹" },
  { slug:"torino", name:"Torino", league:"Serie A 🇮🇹" },
  { slug:"bologna", name:"Bologna", league:"Serie A 🇮🇹" },
  { slug:"udinese", name:"Udinese", league:"Serie A 🇮🇹" },
  { slug:"genoa", name:"Genoa", league:"Serie A 🇮🇹" },
  { slug:"cagliari", name:"Cagliari", league:"Serie A 🇮🇹" },
  { slug:"lecce", name:"Lecce", league:"Serie A 🇮🇹" },
  { slug:"empoli", name:"Empoli", league:"Serie A 🇮🇹" },
  { slug:"verona", name:"Hellas Verona", league:"Serie A 🇮🇹" },
  { slug:"venezia", name:"Venezia", league:"Serie A 🇮🇹" },
  { slug:"como", name:"Como", league:"Serie A 🇮🇹" },
  { slug:"monza", name:"Monza", league:"Serie A 🇮🇹" },
  { slug:"parma", name:"Parma", league:"Serie A 🇮🇹" },
  { slug:"sassuolo", name:"Sassuolo", league:"Serie B 🇮🇹" },
  { slug:"pisa", name:"Pisa", league:"Serie B 🇮🇹" },
  { slug:"spezia", name:"Spezia", league:"Serie B 🇮🇹" },
  { slug:"cremonese", name:"Cremonese", league:"Serie B 🇮🇹" },
  { slug:"bari", name:"Bari", league:"Serie B 🇮🇹" },
  { slug:"palermo", name:"Palermo", league:"Serie B 🇮🇹" },
  { slug:"catanzaro", name:"Catanzaro", league:"Serie B 🇮🇹" },
  { slug:"brescia", name:"Brescia", league:"Serie B 🇮🇹" },
  { slug:"mantova", name:"Mantova", league:"Serie B 🇮🇹" },
  { slug:"cesena", name:"Cesena", league:"Serie B 🇮🇹" },
  { slug:"juve-stabia", name:"Juve Stabia", league:"Serie B 🇮🇹" },
  { slug:"modena", name:"Modena", league:"Serie B 🇮🇹" },
  { slug:"salernitana", name:"Salernitana", league:"Serie B 🇮🇹" },
  { slug:"frosinone", name:"Frosinone", league:"Serie B 🇮🇹" },
  { slug:"reggiana", name:"Reggiana", league:"Serie B 🇮🇹" },
  { slug:"carrarese", name:"Carrarese", league:"Serie B 🇮🇹" },
  { slug:"cittadella", name:"Cittadella", league:"Serie B 🇮🇹" },
  { slug:"sudtirol", name:"SV Südtirol", league:"Serie B 🇮🇹" },
  { slug:"cosenza", name:"Cosenza", league:"Serie B 🇮🇹" },
  { slug:"sampdoria", name:"Sampdoria", league:"Serie B 🇮🇹" },
  // ═══ FRANCE ═══
  { slug:"psg", name:"Paris Saint-Germain", league:"Ligue 1 🇫🇷" },
  { slug:"marseille", name:"Marseille", league:"Ligue 1 🇫🇷" },
  { slug:"monaco", name:"Monaco", league:"Ligue 1 🇫🇷" },
  { slug:"lyon", name:"Lyon", league:"Ligue 1 🇫🇷" },
  { slug:"lille", name:"Lille", league:"Ligue 1 🇫🇷" },
  { slug:"nice", name:"Nice", league:"Ligue 1 🇫🇷" },
  { slug:"rennes", name:"Rennes", league:"Ligue 1 🇫🇷" },
  { slug:"lens", name:"Lens", league:"Ligue 1 🇫🇷" },
  { slug:"strasbourg", name:"Strasbourg", league:"Ligue 1 🇫🇷" },
  { slug:"nantes", name:"Nantes", league:"Ligue 1 🇫🇷" },
  { slug:"reims", name:"Reims", league:"Ligue 1 🇫🇷" },
  { slug:"montpellier", name:"Montpellier", league:"Ligue 1 🇫🇷" },
  { slug:"toulouse", name:"Toulouse", league:"Ligue 1 🇫🇷" },
  { slug:"brest", name:"Brest", league:"Ligue 1 🇫🇷" },
  { slug:"saint-etienne", name:"Saint-Etienne", league:"Ligue 1 🇫🇷" },
  { slug:"angers", name:"Angers", league:"Ligue 1 🇫🇷" },
  { slug:"auxerre", name:"Auxerre", league:"Ligue 1 🇫🇷" },
  { slug:"le-havre", name:"Le Havre", league:"Ligue 1 🇫🇷" },
  { slug:"dunkerque", name:"USL Dunkerque", league:"Ligue 2 🇫🇷" },
  { slug:"ajaccio", name:"AC Ajaccio", league:"Ligue 2 🇫🇷" },
  { slug:"guingamp", name:"EA Guingamp", league:"Ligue 2 🇫🇷" },
  { slug:"amiens", name:"Amiens SC", league:"Ligue 2 🇫🇷" },
  { slug:"bastia", name:"SC Bastia", league:"Ligue 2 🇫🇷" },
  { slug:"grenoble", name:"Grenoble Foot", league:"Ligue 2 🇫🇷" },
  { slug:"laval", name:"Stade Lavallois", league:"Ligue 2 🇫🇷" },
  { slug:"caen", name:"SM Caen", league:"Ligue 2 🇫🇷" },
  { slug:"troyes", name:"ESTAC Troyes", league:"Ligue 2 🇫🇷" },
  { slug:"metz", name:"FC Metz", league:"Ligue 2 🇫🇷" },
  { slug:"bordeaux", name:"FC Girondins Bordeaux", league:"Ligue 2 🇫🇷" },
  { slug:"quevilly", name:"Quevilly Rouen", league:"Ligue 2 🇫🇷" },
  { slug:"valenciennes", name:"Valenciennes FC", league:"Ligue 2 🇫🇷" },
  { slug:"lorient", name:"FC Lorient", league:"Ligue 2 🇫🇷" },
  { slug:"rodez", name:"Rodez AF", league:"Ligue 2 🇫🇷" },
  { slug:"concarneau", name:"US Concarneau", league:"Ligue 2 🇫🇷" },
  { slug:"pau", name:"Pau FC", league:"Ligue 2 🇫🇷" },
  { slug:"niort", name:"Chamois Niortais", league:"Ligue 2 🇫🇷" },
  { slug:"sochaux", name:"FC Sochaux", league:"Ligue 2 🇫🇷" },
  // ═══ NETHERLANDS ═══
  { slug:"ajax", name:"Ajax", league:"Eredivisie 🇳🇱" },
  { slug:"psv", name:"PSV Eindhoven", league:"Eredivisie 🇳🇱" },
  { slug:"feyenoord", name:"Feyenoord", league:"Eredivisie 🇳🇱" },
  { slug:"az-alkmaar", name:"AZ Alkmaar", league:"Eredivisie 🇳🇱" },
  { slug:"twente", name:"FC Twente", league:"Eredivisie 🇳🇱" },
  { slug:"utrecht", name:"FC Utrecht", league:"Eredivisie 🇳🇱" },
  { slug:"groningen", name:"FC Groningen", league:"Eredivisie 🇳🇱" },
  { slug:"heerenveen", name:"SC Heerenveen", league:"Eredivisie 🇳🇱" },
  { slug:"sparta-rotterdam", name:"Sparta Rotterdam", league:"Eredivisie 🇳🇱" },
  { slug:"go-ahead-eagles", name:"Go Ahead Eagles", league:"Eredivisie 🇳🇱" },
  { slug:"almere", name:"Almere City", league:"Eredivisie 🇳🇱" },
  { slug:"fortuna-sittard", name:"Fortuna Sittard", league:"Eredivisie 🇳🇱" },
  { slug:"nec", name:"NEC Nijmegen", league:"Eredivisie 🇳🇱" },
  { slug:"waalwijk", name:"RKC Waalwijk", league:"Eredivisie 🇳🇱" },
  { slug:"zwolle", name:"PEC Zwolle", league:"Eredivisie 🇳🇱" },
  { slug:"heracles", name:"Heracles", league:"Eredivisie 🇳🇱" },
  { slug:"excelsior", name:"Excelsior", league:"Eredivisie 🇳🇱" },
  { slug:"roda", name:"Roda JC", league:"Eredivisie 🇳🇱" },
  { slug:"den-bosch", name:"FC Den Bosch", league:"Eerste Divisie 🇳🇱" },
  { slug:"eindhoven", name:"FC Eindhoven", league:"Eerste Divisie 🇳🇱" },
  { slug:"jong-ajax", name:"Jong Ajax", league:"Eerste Divisie 🇳🇱" },
  { slug:"jong-psv", name:"Jong PSV", league:"Eerste Divisie 🇳🇱" },
  { slug:"jong-az", name:"Jong AZ", league:"Eerste Divisie 🇳🇱" },
  { slug:"jong-utrecht", name:"Jong Utrecht", league:"Eerste Divisie 🇳🇱" },
  { slug:"telstar", name:"Telstar", league:"Eerste Divisie 🇳🇱" },
  { slug:"fc-volendam", name:"FC Volendam", league:"Eerste Divisie 🇳🇱" },
  { slug:"top-oss", name:"TOP Oss", league:"Eerste Divisie 🇳🇱" },
  { slug:"fc-dordrecht", name:"FC Dordrecht", league:"Eerste Divisie 🇳🇱" },
  { slug:"ado-den-haag", name:"ADO Den Haag", league:"Eerste Divisie 🇳🇱" },
  { slug:"helmond-sport", name:"Helmond Sport", league:"Eerste Divisie 🇳🇱" },
  { slug:"de-graafschap", name:"De Graafschap", league:"Eerste Divisie 🇳🇱" },
  { slug:"cambuur", name:"SC Cambuur", league:"Eerste Divisie 🇳🇱" },
  { slug:"vvv-venlo", name:"VVV-Venlo", league:"Eerste Divisie 🇳🇱" },
  { slug:"jong-feyenoord", name:"Jong Feyenoord", league:"Eerste Divisie 🇳🇱" },
  { slug:"jong-twente", name:"Jong FC Twente", league:"Eerste Divisie 🇳🇱" },
  { slug:"fc-emmen", name:"FC Emmen", league:"Eerste Divisie 🇳🇱" },
  // ═══ BRAZIL ═══
  { slug:"flamengo", name:"Flamengo", league:"Série A Brasil 🇧🇷" },
  { slug:"palmeiras", name:"Palmeiras", league:"Série A Brasil 🇧🇷" },
  { slug:"atletico-mineiro", name:"Atlético Mineiro", league:"Série A Brasil 🇧🇷" },
  { slug:"fluminense", name:"Fluminense", league:"Série A Brasil 🇧🇷" },
  { slug:"sao-paulo", name:"São Paulo", league:"Série A Brasil 🇧🇷" },
  { slug:"corinthians", name:"Corinthians", league:"Série A Brasil 🇧🇷" },
  { slug:"internacional", name:"Internacional", league:"Série A Brasil 🇧🇷" },
  { slug:"gremio", name:"Grêmio", league:"Série A Brasil 🇧🇷" },
  { slug:"vasco", name:"Vasco da Gama", league:"Série A Brasil 🇧🇷" },
  { slug:"botafogo", name:"Botafogo", league:"Série A Brasil 🇧🇷" },
  { slug:"santos", name:"Santos", league:"Série A Brasil 🇧🇷" },
  { slug:"cruzeiro", name:"Cruzeiro", league:"Série A Brasil 🇧🇷" },
  { slug:"sport-recife", name:"Sport Recife", league:"Série A Brasil 🇧🇷" },
  { slug:"fortaleza", name:"Fortaleza", league:"Série A Brasil 🇧🇷" },
  { slug:"bragantino", name:"Red Bull Bragantino", league:"Série A Brasil 🇧🇷" },
  { slug:"athletico-pr", name:"Athletico Paranaense", league:"Série A Brasil 🇧🇷" },
  { slug:"bahia", name:"Bahia", league:"Série A Brasil 🇧🇷" },
  { slug:"criciuma", name:"Criciúma", league:"Série A Brasil 🇧🇷" },
  { slug:"juventude", name:"Juventude", league:"Série A Brasil 🇧🇷" },
  { slug:"cuiaba", name:"Cuiabá", league:"Série A Brasil 🇧🇷" },
  // ═══ USA ═══
  { slug:"la-galaxy", name:"LA Galaxy", league:"MLS 🇺🇸" },
  { slug:"lafc", name:"LAFC", league:"MLS 🇺🇸" },
  { slug:"seattle-sounders", name:"Seattle Sounders", league:"MLS 🇺🇸" },
  { slug:"portland-timbers", name:"Portland Timbers", league:"MLS 🇺🇸" },
  { slug:"atlanta-united", name:"Atlanta United", league:"MLS 🇺🇸" },
  { slug:"inter-miami", name:"Inter Miami", league:"MLS 🇺🇸" },
  { slug:"new-york-city", name:"New York City FC", league:"MLS 🇺🇸" },
  { slug:"new-york-rb", name:"New York Red Bulls", league:"MLS 🇺🇸" },
  { slug:"toronto-fc", name:"Toronto FC", league:"MLS 🇺🇸" },
  { slug:"montreal-impact", name:"CF Montréal", league:"MLS 🇺🇸" },
  { slug:"new-england", name:"New England Revolution", league:"MLS 🇺🇸" },
  { slug:"philadelphia-union", name:"Philadelphia Union", league:"MLS 🇺🇸" },
  { slug:"dc-united", name:"DC United", league:"MLS 🇺🇸" },
  { slug:"columbus-crew", name:"Columbus Crew", league:"MLS 🇺🇸" },
  { slug:"chicago-fire", name:"Chicago Fire", league:"MLS 🇺🇸" },
  { slug:"fc-dallas", name:"FC Dallas", league:"MLS 🇺🇸" },
  { slug:"houston-dynamo", name:"Houston Dynamo", league:"MLS 🇺🇸" },
  { slug:"sporting-kc", name:"Sporting Kansas City", league:"MLS 🇺🇸" },
  { slug:"real-salt-lake", name:"Real Salt Lake", league:"MLS 🇺🇸" },
  { slug:"colorado-rapids", name:"Colorado Rapids", league:"MLS 🇺🇸" },
  { slug:"san-jose", name:"San Jose Earthquakes", league:"MLS 🇺🇸" },
  { slug:"vancouver-whitecaps", name:"Vancouver Whitecaps", league:"MLS 🇺🇸" },
  { slug:"minnesota-united", name:"Minnesota United", league:"MLS 🇺🇸" },
  { slug:"nashville-sc", name:"Nashville SC", league:"MLS 🇺🇸" },
  { slug:"orlando-city", name:"Orlando City", league:"MLS 🇺🇸" },
  { slug:"charlotte-fc", name:"Charlotte FC", league:"MLS 🇺🇸" },
  { slug:"austin-fc", name:"Austin FC", league:"MLS 🇺🇸" },
  { slug:"st-louis-city", name:"St. Louis City SC", league:"MLS 🇺🇸" },
  { slug:"san-diego-fc", name:"San Diego FC", league:"MLS 🇺🇸" },
  // ═══ JAPAN ═══
  { slug:"vissel-kobe", name:"Vissel Kobe", league:"J-League 🇯🇵" },
  { slug:"gamba-osaka", name:"Gamba Osaka", league:"J-League 🇯🇵" },
  { slug:"kawasaki", name:"Kawasaki Frontale", league:"J-League 🇯🇵" },
  { slug:"urawa-reds", name:"Urawa Red Diamonds", league:"J-League 🇯🇵" },
  { slug:"kashima", name:"Kashima Antlers", league:"J-League 🇯🇵" },
  { slug:"yokohama-fm", name:"Yokohama F. Marinos", league:"J-League 🇯🇵" },
  { slug:"nagoya", name:"Nagoya Grampus", league:"J-League 🇯🇵" },
  { slug:"cerezo", name:"Cerezo Osaka", league:"J-League 🇯🇵" },
  { slug:"sanfrecce", name:"Sanfrecce Hiroshima", league:"J-League 🇯🇵" },
  { slug:"sagan-tosu", name:"Sagan Tosu", league:"J-League 🇯🇵" },
  { slug:"avispa", name:"Avispa Fukuoka", league:"J-League 🇯🇵" },
  { slug:"shimizu", name:"Shimizu S-Pulse", league:"J-League 🇯🇵" },
  { slug:"consadole", name:"Consadole Sapporo", league:"J-League 🇯🇵" },
  { slug:"jubilo", name:"Jubilo Iwata", league:"J-League 🇯🇵" },
  { slug:"albirex", name:"Albirex Niigata", league:"J-League 🇯🇵" },
  { slug:"machida", name:"Machida Zelvia", league:"J-League 🇯🇵" },
  { slug:"shonan", name:"Shonan Bellmare", league:"J-League 🇯🇵" },
  { slug:"fc-tokyo", name:"FC Tokyo", league:"J-League 🇯🇵" },
  { slug:"kyoto", name:"Kyoto Sanga", league:"J-League 🇯🇵" },
  { slug:"tokyo-verdy", name:"Tokyo Verdy", league:"J-League 🇯🇵" },
];

const DEF = { xgFor:1.5, xgAgainst:1.3, formPts:8, avgXgLast5:1.5, avgXgaLast5:1.3, pressureSucc:30, psxgDiff:0, passPct:80, form:["W","D","L","W","D"] };

function poisson(lam, k) {
  if (lam <= 0) return k === 0 ? 1 : 0;
  let r = Math.exp(-lam) * Math.pow(lam, k), f = 1;
  for (let i = 1; i <= k; i++) f *= i;
  return r / f;
}

function predict(h, a, h2h, odds) {
  let hL = (h.avgXgLast5 + a.avgXgaLast5) / 2 * 1.10;
  let aL = (a.avgXgLast5 + h.avgXgaLast5) / 2;
  const ff = 1 + ((h.formPts - a.formPts) / 15) * 0.15;
  hL *= ff; aL /= ff;
  hL *= (1 - Math.max(-0.15, Math.min(0.15, (a.psxgDiff||0)*0.02)));
  aL *= (1 - Math.max(-0.15, Math.min(0.15, (h.psxgDiff||0)*0.02)));
  const pf = 1 + ((h.pressureSucc||30)/100 - (a.pressureSucc||30)/100) * 0.20;
  hL *= pf; aL /= pf;
  hL = Math.max(0.3, Math.min(hL, 5.5));
  aL = Math.max(0.3, Math.min(aL, 5.5));
  let hW=0, d=0, aW=0, lines=[];
  for (let i=0; i<=7; i++) for (let j=0; j<=7; j++) {
    const p = poisson(hL,i)*poisson(aL,j);
    lines.push({h:i,a:j,p});
    if(i>j) hW+=p; else if(i===j) d+=p; else aW+=p;
  }
  let mH=0.33,mD=0.27,mA=0.40;
  if(odds?.home){ const rH=1/(parseFloat(odds.home)||2),rD=1/(parseFloat(odds.draw)||3.5),rA=1/(parseFloat(odds.away)||3),s=rH+rD+rA; mH=rH/s;mD=rD/s;mA=rA/s; }
  const fH=0.6*hW+0.4*mH, fD=0.6*d+0.4*mD, fA=0.6*aW+0.4*mA, tot=fH+fD+fA;
  const nH=fH/tot, nD=fD/tot, nA=fA/tot;
  lines.sort((a,b)=>b.p-a.p);
  let o25=0,o35=0,btts=(1-poisson(hL,0))*(1-poisson(aL,0));
  for(const s of lines){ if(s.h+s.a>2) o25+=s.p; if(s.h+s.a>3) o35+=s.p; }
  const mx=Math.max(nH,nD,nA);
  return {
    homeWin:Math.round(nH*100), draw:Math.round(nD*100), awayWin:Math.round(nA*100),
    confidence: mx>0.52?"HIGH":mx>0.40?"MEDIUM":"LOW",
    confColor: mx>0.52?"#00ff88":mx>0.40?"#ffcc00":"#ff6b6b",
    topScores: lines.slice(0,6).map(s=>({score:`${s.h}-${s.a}`,prob:Math.round(s.p*100)})),
    xg:{home:hL.toFixed(2),away:aL.toFixed(2)},
    btts:Math.round(btts*100), over25:Math.round(o25*100), over35:Math.round(o35*100),
  };
}

const card = { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"12px 14px" };
const lbl = { fontSize:9, color:"#3a5570", letterSpacing:2, marginBottom:5, display:"block", textTransform:"uppercase" };
const inp = { background:"rgba(0,8,24,0.9)", border:"1px solid rgba(255,255,255,0.09)", color:"#cce0ff", padding:"8px 10px", borderRadius:8, fontSize:12, outline:"none", fontFamily:"monospace", width:"100%" };

function Bar({label, pct, color, sub}) {
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontSize:12,color:"#aabbcc"}}>{label}</span>
        <span style={{fontSize:20,color,fontWeight:900}}>{pct}%</span>
      </div>
      <div style={{height:6,background:"rgba(255,255,255,0.05)",borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:3,transition:"width 1.2s"}}/>
      </div>
      {sub && <div style={{fontSize:9,color:"#3a5570",marginTop:2}}>{sub}</div>}
    </div>
  );
}

function FormDot({r}) {
  const map={W:"#00ff88",D:"#ffcc00",L:"#ff6b6b"};
  return <div style={{width:22,height:22,borderRadius:4,fontSize:9,fontWeight:800,background:`${map[r]||"#888"}22`,border:`1px solid ${map[r]||"#888"}`,color:map[r]||"#888",display:"flex",alignItems:"center",justifyContent:"center"}}>{r}</div>;
}


function TeamPicker({value, onChange, label}) {
  const [open, setOpen] = useState(false);
  const [openLeague, setOpenLeague] = useState(null);
  const leagues = [...new Set(TEAMS.map(t=>t.league))];
  const selected = TEAMS.find(t=>t.slug===value);
  const pick = (slug) => { onChange(slug); setOpen(false); setOpenLeague(null); };
  return (
    <div style={{position:"relative"}}>
      <span style={lbl}>{label}</span>
      <div onClick={()=>setOpen(o=>!o)} style={{...inp,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",userSelect:"none"}}>
        <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selected?.name||"Pilih tim"}</span>
        <span style={{marginLeft:6,fontSize:10,color:"#3a5570",flexShrink:0}}>{open?"▲":"▼"}</span>
      </div>
      {open && (
        <div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:100,background:"#050e1f",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,maxHeight:340,overflowY:"auto",marginTop:2}}>
          {leagues.map(lg=>{
            const isOpen = openLeague===lg;
            const teamsInLg = TEAMS.filter(t=>t.league===lg);
            return (
              <div key={lg}>
                <div onClick={()=>setOpenLeague(isOpen?null:lg)} style={{padding:"8px 12px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",background:isOpen?"rgba(0,255,136,0.05)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                  <span style={{fontSize:11,color:isOpen?"#00ff88":"#7a9ab0",fontWeight:isOpen?700:400}}>{lg}</span>
                  <span style={{fontSize:9,color:"#3a5570"}}>{isOpen?"▲":`▼ ${teamsInLg.length} tim`}</span>
                </div>
                {isOpen && teamsInLg.map(t=>(
                  <div key={t.slug} onClick={()=>pick(t.slug)} style={{padding:"7px 20px",cursor:"pointer",fontSize:12,color:t.slug===value?"#00ff88":"#aabbcc",background:t.slug===value?"rgba(0,255,136,0.07)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                    {t.slug===value?"✓ ":""}{t.name}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default function App() {
  const [home, setHome] = useState("manchester-city");
  const [away, setAway] = useState("arsenal");
  const [odds, setOdds] = useState({home:"1.80",draw:"3.70",away:"4.50"});
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);
  const [src, setSrc] = useState("");
  const [hStats, setHStats] = useState(null);
  const [aStats, setAStats] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [chatLoad, setChatLoad] = useState(false);
  const [tab, setTab] = useState("predict");
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs]);

  const homeTeam = TEAMS.find(t=>t.slug===home);
  const awayTeam = TEAMS.find(t=>t.slug===away);
  const leagues = [...new Set(TEAMS.map(t=>t.league))];

  const run = useCallback(async () => {
    if (home===away) return;
    setState("loading"); setResult(null); setMsgs([]); setTab("predict");
    try {
      let hs, as_, h2h={homeWins:1,awayWins:1,draws:1};
      try {
        const res = await fetch(`${BACKEND_URL}/match/${home}/${away}`,{signal:AbortSignal.timeout(60000)});
        if (res.ok) {
          const data = await res.json();
          const d = data.derived;
          hs = { avgXgLast5:d.home_avg_xg_last5||1.5, avgXgaLast5:d.home_avg_xga_last5||1.3, formPts:d.home_form_pts||8, pressureSucc:d.home_press_succ||30, psxgDiff:d.home_psxg_diff||0, passPct:d.home_pass_pct||80, xgFor:d.home_xg_per_game||1.5, xgAgainst:d.home_avg_xga_last5||1.3, form:data.home?.form?.form_string?.split("")||["W","D","L","W","D"] };
          as_ = { avgXgLast5:d.away_avg_xg_last5||1.5, avgXgaLast5:d.away_avg_xga_last5||1.3, formPts:d.away_form_pts||8, pressureSucc:d.away_press_succ||30, psxgDiff:d.away_psxg_diff||0, passPct:d.away_pass_pct||80, xgFor:d.away_xg_per_game||1.5, xgAgainst:d.away_avg_xga_last5||1.3, form:data.away?.form?.form_string?.split("")||["W","D","L","W","D"] };
          h2h = { homeWins:data.h2h?.home_wins||0, awayWins:data.h2h?.away_wins||0, draws:data.h2h?.draws||0 };
          setSrc("🟢 Live — FBref / StatsBomb");
        } else throw new Error();
      } catch {
        hs = {...DEF}; as_ = {...DEF};
        setSrc("🔴 Fallback (tim belum ada di FBref backend)");
      }
      setHStats(hs); setAStats(as_);
      const res = predict(hs, as_, h2h, odds);
      setResult(res); setState("done");
      setChatLoad(true); setTab("chat");
      try {
        const ctx = `${homeTeam?.name} vs ${awayTeam?.name} | xG: ${res.xg.home}-${res.xg.away} | Win%: ${res.homeWin}/${res.draw}/${res.awayWin} | BTTS:${res.btts}% O2.5:${res.over25}%`;
        const r = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,system:`Kamu BOLA.AI, analis sepak bola data-driven. Context: ${ctx}. Jawab singkat, pakai angka, Bahasa Indonesia.`,messages:[{role:"user",content:`Analisis singkat ${homeTeam?.name} vs ${awayTeam?.name}, highlight 2-3 faktor utama.`}]})});
        const d = await r.json();
        const txt = d.content?.map(b=>b.text||"").join("")||"";
        setMsgs([{role:"ai",content:txt.replace(/\n/g,"<br>")}]);
      } catch { setMsgs([{role:"ai",content:"Analisis siap. Tanya apa saja!"}]); }
      setChatLoad(false); setTab("predict");
    } catch(e) { setState("error"); }
  }, [home, away, odds, homeTeam, awayTeam]);

  const sendChat = async () => {
    if (!input.trim()||chatLoad) return;
    const nm = [...msgs,{role:"user",content:input}];
    setMsgs(nm); setInput(""); setChatLoad(true);
    try {
      const apiM = nm.map(m=>({role:m.role==="ai"?"assistant":"user",content:m.content.replace(/<[^>]*>/g,"")}));
      const ctx = result ? `${homeTeam?.name} vs ${awayTeam?.name} | ${result.homeWin}/${result.draw}/${result.awayWin}% | xG ${result.xg.home}-${result.xg.away}` : "";
      const r = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,system:`BOLA.AI analis. Context: ${ctx}`,messages:apiM})});
      const d = await r.json();
      setMsgs(p=>[...p,{role:"ai",content:(d.content?.map(b=>b.text||"").join("")||"Error").replace(/\n/g,"<br>")}]);
    } catch { setMsgs(p=>[...p,{role:"ai",content:"Error koneksi."}]); }
    setChatLoad(false);
  };

  return (
    <div style={{minHeight:"100vh",background:"#010812",fontFamily:"monospace",color:"#cce0ff"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(0,255,136,0.2)} *{box-sizing:border-box} select option{background:#0a1428} optgroup{background:#050e1f}`}</style>
      <div style={{background:"rgba(0,3,12,0.95)",borderBottom:"1px solid rgba(255,255,255,0.05)",padding:"12px 16px",position:"sticky",top:0,zIndex:10}}>
        <div style={{maxWidth:760,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:18,fontWeight:900,letterSpacing:2}}>⚽ BOLA<span style={{color:"#00ff88"}}>.AI</span></div>
            <div style={{fontSize:9,color:"#2a4060"}}>FBref · StatsBomb · {TEAMS.length} Tim · 13 Liga</div>
          </div>
          <div style={{textAlign:"right",fontSize:9}}>
            <div style={{color:"#3a5570",marginBottom:2}}>BACKEND</div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:"#00ff88"}}/>
              <span style={{color:"#00ff88"}}>ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:760,margin:"0 auto",padding:"12px 12px 24px",display:"flex",flexDirection:"column",gap:10}}>
        <div style={card}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 30px 1fr",gap:10,alignItems:"end",marginBottom:12}}>
            <TeamPicker value={home} onChange={setHome} label="🏠 Home"/>
            <div style={{textAlign:"center",color:"#2a4060",fontWeight:700,paddingTop:22}}>VS</div>
            <TeamPicker value={away} onChange={setAway} label="✈️ Away"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
            {[["home","Home"],["draw","Draw"],["away","Away"]].map(([k,lb])=>(
              <div key={k}><span style={lbl}>{lb} Odds</span><input type="text" inputMode="decimal" placeholder="e.g. 2.50" value={odds[k]} onChange={e=>setOdds(p=>({...p,[k]:e.target.value}))} onFocus={e=>e.target.select()} style={inp}/></div>
            ))}
          </div>
          <button onClick={run} disabled={home===away||state==="loading"} style={{width:"100%",padding:12,borderRadius:10,border:"none",background:home===away||state==="loading"?"rgba(255,255,255,0.04)":"linear-gradient(135deg,#00ff88,#00cc88)",color:home===away||state==="loading"?"#444":"#001a0d",fontWeight:900,fontSize:13,letterSpacing:3,cursor:"pointer",fontFamily:"monospace"}}>
            {state==="loading"?"⏳ FETCHING DATA...":"🔮 ANALISIS"}
          </button>
          {src&&<div style={{marginTop:8,fontSize:10,textAlign:"center",color:src.includes("Live")?"#00ff88":"#ff9944"}}>{src}</div>}
        </div>

        {state==="done"&&result&&(
          <>
            <div style={{display:"flex",gap:6}}>
              {[["predict","🎯 Prediksi"],["stats","📊 Stats"],["chat","💬 Chat AI"]].map(([t,l])=>(
                <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:8,borderRadius:8,border:"none",background:tab===t?"rgba(0,255,136,0.10)":"rgba(255,255,255,0.03)",color:tab===t?"#00ff88":"#445566",fontSize:11,cursor:"pointer",fontFamily:"monospace",borderBottom:tab===t?"2px solid #00ff88":"2px solid transparent"}}>{l}</button>
              ))}
            </div>
            {tab==="predict"&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{...card,textAlign:"center"}}>
                  <div style={{fontSize:9,color:"#3a5570",marginBottom:14}}>{homeTeam?.name} vs {awayTeam?.name}</div>
                  <Bar label={`🏠 ${homeTeam?.name}`} pct={result.homeWin} color="#4488ff" sub={`Odds: ${odds.home||"-"}`}/>
                  <Bar label="🤝 Draw" pct={result.draw} color="#ffcc00" sub={`Odds: ${odds.draw||"-"}`}/>
                  <Bar label={`✈️ ${awayTeam?.name}`} pct={result.awayWin} color="#00ff88" sub={`Odds: ${odds.away||"-"}`}/>
                  <div style={{marginTop:10,display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap"}}>
                    <span style={{padding:"2px 8px",borderRadius:10,fontSize:9,background:`${result.confColor}22`,border:`1px solid ${result.confColor}`,color:result.confColor}}>Confidence: {result.confidence}</span>
                    <span style={{padding:"2px 8px",borderRadius:10,fontSize:9,background:"rgba(170,187,204,0.1)",border:"1px solid rgba(170,187,204,0.3)",color:"#aabbcc"}}>xG {result.xg.home} - {result.xg.away}</span>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {[["BTTS",`${result.btts}%`,"#ffcc00"],["Over 2.5",`${result.over25}%`,"#ff9944"],["Over 3.5",`${result.over35}%`,"#ff6b6b"]].map(([l,v,c])=>(
                    <div key={l} style={{...card,textAlign:"center"}}><div style={{fontSize:8,color:"#3a5570"}}>{l}</div><div style={{fontSize:16,color:c,fontWeight:800}}>{v}</div></div>
                  ))}
                </div>
                <div style={card}>
                  <span style={lbl}>Probabilitas Skor</span>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {result.topScores.map(({score,prob},i)=>(
                      <div key={score} style={{padding:"4px 12px",borderRadius:20,fontSize:12,background:i===0?"rgba(0,255,136,0.10)":"rgba(255,255,255,0.04)",border:`1px solid ${i===0?"rgba(0,255,136,0.3)":"rgba(255,255,255,0.08)"}`,color:i===0?"#00ff88":"#889aaa",fontWeight:i===0?700:400}}>
                        {score} <span style={{fontSize:10,opacity:0.6}}>{prob}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {tab==="stats"&&hStats&&aStats&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={card}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",marginBottom:12,textAlign:"center"}}>
                    <div style={{color:"#4488ff",fontSize:12,fontWeight:700}}>{homeTeam?.name}</div>
                    <div style={{fontSize:9,color:"#3a5570",padding:"0 8px"}}>STATS</div>
                    <div style={{color:"#00ff88",fontSize:12,fontWeight:700}}>{awayTeam?.name}</div>
                  </div>
                  {[["xG/Game",hStats.avgXgLast5,aStats.avgXgLast5,true],["xGA/Game",hStats.avgXgaLast5,aStats.avgXgaLast5,false],["Form Pts",hStats.formPts,aStats.formPts,true],["Press%",hStats.pressureSucc,aStats.pressureSucc,true],["PSxG-GA",hStats.psxgDiff,aStats.psxgDiff,true],["Pass%",hStats.passPct,aStats.passPct,true]].map(([lb,hv,av,hi])=>{
                    const hval=parseFloat(hv)||0,aval=parseFloat(av)||0;
                    return(
                      <div key={lb} style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center",marginBottom:8}}>
                        <div style={{textAlign:"right",fontSize:12,fontWeight:700,color:hi?hval>=aval?"#00ff88":"#889aaa":hval<=aval?"#00ff88":"#889aaa"}}>{typeof hv==="number"?hv.toFixed(1):hv}</div>
                        <div style={{fontSize:9,color:"#3a5570",textAlign:"center",minWidth:80}}>{lb}</div>
                        <div style={{fontSize:12,fontWeight:700,color:hi?aval>hval?"#00ff88":"#889aaa":aval<hval?"#00ff88":"#889aaa"}}>{typeof av==="number"?av.toFixed(1):av}</div>
                      </div>
                    );
                  })}
                </div>
                {[{team:homeTeam,form:hStats.form,c:"#4488ff"},{team:awayTeam,form:aStats.form,c:"#00ff88"}].map(({team,form,c})=>(
                  <div key={team?.slug} style={card}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                      <span style={{color:c,fontWeight:700}}>{team?.name}</span>
                      <span style={{fontSize:9,color:"#3a5570"}}>FORM 5 LAGA</span>
                    </div>
                    <div style={{display:"flex",gap:6}}>{(form||[]).map((r,i)=><FormDot key={i} r={r}/>)}</div>
                  </div>
                ))}
              </div>
            )}
            {tab==="chat"&&(
              <div style={{...card,display:"flex",flexDirection:"column"}}>
                <div style={{fontSize:9,color:"#2a4060",marginBottom:12}}>💬 {homeTeam?.name} VS {awayTeam?.name}</div>
                <div style={{overflowY:"auto",maxHeight:360,marginBottom:10}}>
                  {msgs.length===0&&!chatLoad&&<div style={{textAlign:"center",color:"#2a4060",fontSize:11,marginTop:30}}>Jalankan analisis dulu...</div>}
                  {msgs.map((m,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:m.role==="ai"?"flex-start":"flex-end",marginBottom:12}}>
                      {m.role==="ai"&&<div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#00ff88,#00aaff)",display:"flex",alignItems:"center",justifyContent:"center",marginRight:8,flexShrink:0}}>⚽</div>}
                      <div style={{maxWidth:"82%",padding:"9px 13px",borderRadius:m.role==="ai"?"3px 14px 14px 14px":"14px 3px 14px 14px",background:m.role==="ai"?"rgba(0,255,136,0.07)":"rgba(0,150,255,0.10)",border:m.role==="ai"?"1px solid rgba(0,255,136,0.15)":"1px solid rgba(0,150,255,0.15)",color:"#cce0ff",fontSize:13,lineHeight:1.65}}>
                        <div dangerouslySetInnerHTML={{__html:m.content}}/>
                      </div>
                    </div>
                  ))}
                  {chatLoad&&<div style={{color:"#00ff88",fontSize:12,padding:8}}>⚽ Menganalisis...</div>}
                  <div ref={bottomRef}/>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Tanya soal xG, form, value bet..." style={{...inp,flex:1,width:"auto"}}/>
                  <button onClick={sendChat} disabled={chatLoad||!input.trim()} style={{padding:"9px 14px",borderRadius:8,border:"none",background:"rgba(0,255,136,0.10)",color:"#00ff88",cursor:"pointer",fontSize:15}}>→</button>
                </div>
                <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
                  {["Siapa favorit?","Value bet mana?","Over 2.5 worth it?","Analisis GK"].map(q=>(
                    <button key={q} onClick={()=>setInput(q)} style={{...inp,width:"auto",padding:"4px 9px",fontSize:10,color:"#445566"}}>{q}</button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        {state==="idle"&&<div style={{...card,textAlign:"center",padding:32}}><div style={{fontSize:32,marginBottom:12}}>⚽</div><div style={{fontSize:13,color:"#445566",lineHeight:2}}>Pilih dua tim lalu klik <strong style={{color:"#00ff88"}}>ANALISIS</strong><br/><span style={{fontSize:10,color:"#3a5570"}}>{TEAMS.length} tim · 13 liga · 7 negara</span></div></div>}
        {state==="error"&&<div style={{...card,textAlign:"center",padding:24,color:"#ff6b6b"}}>❌ Error. Coba lagi.</div>}
        <div style={{textAlign:"center",fontSize:9,color:"#1a3050"}}>BOLA.AI · FBref/StatsBomb · {TEAMS.length} Tim · 13 Liga</div>
      </div>
    </div>
  );
}
