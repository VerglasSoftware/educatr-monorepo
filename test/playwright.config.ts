const config = {
	reporter: [
		["blob"], // required for Artillery's reporter to work
		["@artilleryio/playwright-reporter", { name: "Educatr prd" }],
	],
};
