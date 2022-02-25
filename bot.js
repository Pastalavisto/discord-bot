const puppeteer = require('puppeteer');
const csv = require('csv')
const url = 'https://cas3.e-lyco.fr/discovery/WAYF?entityID=https%3A%2F%2Fcas3.e-lyco.fr%2Fshibboleth&return=https%3A%2F%2Fcas3.e-lyco.fr%2FShibboleth.sso%2FLogin%3FSAMLDS%3D1%26target%3Dss%253Amem%253A01e0e25d2a9baa83f78735371b1fd2d1169dd90058ee09cb60c5191f9bdb015f';
let phrase = "";
let ancien = [];
let date = new Date();
let jour = date.getDay();
async function lancement(ecrire) {
	console.log("lancement du bot");
	const browser = await puppeteer.launch({
		'args' : [
		  '--no-sandbox',
		  '--disable-setuid-sandbox'
		]
	  });
	const page = await browser.newPage();
	await page.goto(url);
	await page.click('#ep4')
	await page.click('#valider')
	await page.waitForNetworkIdle();
	await page.click('#bouton_eleve')
	await page.type('#username',process.env.USER);
	await page.type('#password',process.env.PASSWORD);
	await page.click('#bouton_valider');
	await page.waitForTimeout(5000);
	await page.goto("https://0530012a.index-education.net/pronote/");
	await page.waitForTimeout(15000);
	await page.click('i[onClick ="GInterface.Instances[2]._surToutVoir(7)"] ')
	await page.waitForTimeout(2000);

	const result = await page.evaluate(() => {
    	let journee = Array.from(document.querySelectorAll('li[role="listitem"]'));
    	let e = [];
    	let matiere;
    	let a;
    	let lecon;
    	let tout = [];
    	for (var i = 0; i < journee.length; i++) {
    		try{
    			e.push([journee[i].querySelector("h5").textContent]);
    			tout.push(Array.from(journee[i].querySelectorAll('li[role="listitem"]')));
    		}
    		catch(error){
    			console.error(error)
    		}
    	}
    	for (var m = 0; m < tout.length; m++) {
    		for (var j = 0; j < tout[m].length; j++) {
	    		try{
	    			matiere = tout[m][j].querySelector(".titre-matiere").textContent
		    		a = tout[m][j].querySelector(".description.init-html ")
			    	lecon = a.querySelector("div").textContent
			    	e[m].push([matiere,lecon])
	    		}
	    		catch(error){
	    			console.error(error)
	    		}
    		}	
    	}	
        return e;
	});

	res = result;
	if (ecrire == true){
		console.log("écriture")
		ancien = res;
	}else{
		phrase = egal();
		if (phrase != ""){
			envoyerLecon(phrase);
		}
	}
	console.log("fini")
	ancien = res;
	browser.close();
};

function egal(){
    let tab = [];
    for (let i=0; i<res.length;i++){
        let jour = false;
        for (let n=0; n<ancien.length;n++){
            if (res[i][0] == ancien[n][0]){
                jour = true;
                for (let k=1;k<res[i].length;k++){
                    let ok = false;
                    for (let m=1;m<ancien[n].length;m++){
                        if (res[i][k][0] == ancien[n][m][0] && res[i][k][1] == ancien[n][m][1]){
                            ok = true;
                        }
                    }
                    if (ok == false){
                        tab.push([res[i][0],res[i][k]]);
                    }
                }
            }
        }
        if (jour == false){
            tab.push(res[i]);
        }
    }
    if (tab.length != 0){
    	return convertionPhrase(tab);
    }else{
    	return ""
    }
}

function convertionPhrase(tab){
	w = ""
    for (let i=0;i<tab.length;i++){
        w += tab[i][0]+" : \n";
        for (let n=1;n<tab[i].length;n++){
            w += tab[i][n][0] +" : "+tab[i][n][1]+"\n";
        }
        w+="\n"
    }
    return w
}

const Discord = require("discord.js");
const { start } = require("node:repl");
const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES
    ]

});


client.on("ready", () => {
    console.log("Zéé parti");
});
client.login(process.env.TOKEN);

function envoyerLecon(msg){
	console.log("envoi de leçons");
	client.channels.cache.get("823291198021828721").send(msg);
}

lancement(true);
setInterval(function (){
	a = new Date();
	b = a.getDay();
	if (jour != b){
		console.log("nouveau jour")
		jour = b;
		lancement(true);
	}
	lancement(false);	
},100000);