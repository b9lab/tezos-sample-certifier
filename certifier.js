// This is for demonstration purposes only! Don't handle live keys like this.
// You can hardcode your account settings and contract address here for local testing.
function initUI() {
    updateUISetting({
        provider: "https://florencenet.smartpy.io/",
        mnemonic: "twenty aware media quality beyond summer milk hurry library unknown hover permit conduct switch slogan",
        password: "TUBtLEyYi5",
        email: "hfezymib.ytwslmjd@tezos.example.org",
        contractAddress: "KT1F1eTVrVFoaNuKw1LbQp1oYptjjcqZby2v"
    });

    // setup all UI actions
    $('#btn_issue').click(() => certify($('#inp_address').val()));
    $('#btn_settings').click(() => $('#settings-box').toggle());
    $("#upl_input").on("change", loadJsonFile);
    $('#btn_load').click(() => $("#upl_input").click());
}

function updateUISetting(accountSettings) {
    $('#provider').val(accountSettings.provider);
    $('#mnemonic').val(accountSettings.mnemonic);
    $('#password').val(accountSettings.password);
    $('#email').val(accountSettings.email);
    $('#contractAddress').val(accountSettings.contractAddress);
}

function readUISettings() {
    return {
        provider: $('#provider').val(),
        mnemonic: $('#mnemonic').val(),
        password: $('#password').val(),
        email: $('#email').val(),
        contractAddress: $('#contractAddress').val()
    };
}

function loadJsonFile() {
    // This doesn't work in IE
    const file = $("#upl_input").get(0).files[0];
    const reader = new FileReader();
    const accountSettings = readUISettings();
    reader.onload = parseFaucetJson(accountSettings);
    reader.onloadend = () => updateUISetting(accountSettings);
    reader.readAsText(file);
}

// Parses the faucet json file 
function parseFaucetJson(settingsToFillIn) {
    return function(evnt) {
        const parsed = JSON.parse(evnt.target.result);
        settingsToFillIn.mnemonic = parsed['mnemonic'].join(" ");
        settingsToFillIn.password = parsed['password'];
        settingsToFillIn.email = parsed['email'];
        return settingsToFillIn;
    }
}

function reportResult(result, type, itemSelector) {
    return $(itemSelector)
        .html(result)
        .removeClass()
        .addClass("result-bar")
        .addClass(type == "error" ?
            "result-false" :
            type == "ok" ?
            "result-true" :
            "result-load");
}

// This is the main function, interacting with the contract through taquito
function certify(studentAddress) {
    const accountSettings = readUISettings(),
    tezos = new taquito.TezosToolkit(accountSettings.provider);

    tezos.setProvider({
        signer: InMemorySigner.InMemorySigner
                .fromFundraiser(accountSettings.email, 
                  accountSettings.password, 
                  accountSettings.mnemonic)
    });

    return tezos.contract.at(accountSettings.contractAddress)
        .then((contract) => {
            reportResult("Sending...", "info", "#result-bar");
            return contract.methods.default(studentAddress).send();
        })
        .then((op) => {
            reportResult("Waiting for confirmation...", "info", "#result-bar");
            return op.confirmation(1).then(() => op.hash);
        })
        .then((hash) => {
            reportResult("Operation injected: " + hash, "ok", "#result-bar");
        })
        .catch((error) => {
            reportResult(error.message, "error", "#result-bar");
        });
}

$(document).ready(initUI);