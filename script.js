const apiUrl = 'http://api.exchangeratesapi.io/v1/latest?access_key=050beeaad0ad5cda72460c6758d5a11e&format=1';

const converterInputElem = document.querySelector('#converter-input');
const fromElem = document.querySelector('#from');
const toElem = document.querySelector('#to');
const convertBtn = document.querySelector('#convert-btn');
const errorElem = document.querySelector('#error');
const mainElem = document.querySelector('#main');
const converterResultElem = document.querySelector('#converter-result');
const aboutElem = document.querySelector('#about');

let baseCurrency = '', rates = {}, history = [];

let historyStr = localStorage.getItem('history');

if(historyStr) {
    history = JSON.parse(historyStr);
    renderAbout(history);
}


fromElem.addEventListener('change', function(e) {
    toElem.querySelectorAll('option').forEach(elem => {
        elem.disabled = false;
    });

    const selectedIndex = e.target.value;
    const matchingToOption = toElem.querySelector(`option[value="${selectedIndex}"]`);
    matchingToOption.disabled = true;
});

toElem.addEventListener('change', function(e) {
    fromElem.querySelectorAll('option').forEach(elem => {
        elem.disabled = false;
    });

    const selectedIndex = e.target.value;
    const matchingToOption = fromElem.querySelector(`option[value="${selectedIndex}"]`);
    matchingToOption.disabled = true;
});

convertBtn.addEventListener('click', function() {
    if(!fromElem.value || !toElem.value || !converterInputElem.value) {
        return;
    }

    let sourceCurrency = fromElem.options[fromElem.selectedIndex].text;
    let sourceValue = rates[sourceCurrency];
    let targetCurrency = toElem.options[toElem.selectedIndex].text;
    let targetValue = rates[targetCurrency];
    let exchangeRate = targetValue / sourceValue;

    let result = +converterInputElem.value * exchangeRate;
    let resultText = `${converterInputElem.value} ${sourceCurrency} = ${result.toFixed(2)} ${targetCurrency}`;
    converterResultElem.innerHTML = resultText;

    history.push(resultText);
    localStorage.setItem('history', JSON.stringify(history));
    renderAbout(history);
});

document.querySelectorAll('header a').forEach(elem => {
    elem.addEventListener('click', function(e) {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        mainElem.querySelectorAll('.tab').forEach(elem => {
            let id = elem.getAttribute('id');
            if(id === href.substring(1)) {
                elem.style.display = 'flex';
            } else {
                elem.style.display = 'none';
            }
        });    
    });
})


getRates().then((res) => {
    if(!res) {
        return;
    }

    baseCurrency = res.base;
    rates = res.rates;

    let options = `<option disabled selected></option>`;
    Object.keys(rates).forEach((currency, index) => {
        options += `<option value="${index}">${currency}</option>`;
    });

    fromElem.innerHTML = options;
    toElem.innerHTML = options;
});


async function getRates() {
    try {
        const response = await fetch(apiUrl);

        if(!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);            
        }

        const result = await response.json();

        if (result.success != true || !result.base || !result.rates) {
            throw new Error('invalid data received');
        }

        return result;    
    } catch (ex) {
        console.log('an error has occured while fetching from API:', ex);
        showError();
    }
}



function showError() {
    mainElem.style.display = 'none';
    errorElem.style.display = 'block';
}

function renderAbout(history) {
    let output = '';
    history.forEach(item => {
        output += `<div>${item}</div>`;
    });

    document.querySelector('#history').innerHTML = output;
} 