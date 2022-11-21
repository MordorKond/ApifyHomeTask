//This code works for API that servers the worst possible array
//this is an unsorted array with products that have duplicates
//To make it worse we can only ask the API to filter by price.

//some prices might not be scraped due to many duplicates

//you can give it a test run with the preset variables

//importing and dummy array and dummy fetch function for testing purposes
import { productsArr, fetch } from './dummyData.js';

let products = [];

//commented vars are based on the assingment
const size = productsArr.length; // 99 999
const limit = 20; //  1 000
const maxPrice = 100; //100 000$
const minPrice = 1; //      1$
const suspectDupPrices = new Set();

let minPriceDifference = 0.01; //1 cent
let range = 1;

let reqCount = 0;
let min = (minPrice * 100 - minPriceDifference * 100) / 100;
let max = (min * 100 + range * 100 + minPriceDifference * 100) / 100;

//changes the filter range based on feedback
function dynamicFilterRange(min, max, prices) {
    min = Math.round(min * 100);
    max = Math.round(max * 100);
    minPriceDifference = Math.round(minPriceDifference * 100);

    let range = max - min - minPriceDifference;
    minPriceDifference = minPriceDifference / 100;

    min = min + range;

    if (prices.length <= limit * (2 / 3)) {
        range = range * (3 / 2);
    }
    if (prices.length == limit) {
        range = range * (1 / 5);
    }
    range = Math.ceil(range);
    max = max + range;

    return [min / 100, max / 100, range / 100];
}

async function getPricesBetween(min, max) {
    let response = await fetch(min, max);
    reqCount++;
    return response;
}

async function main() {
    if (products.length >= size) {
        console.log('All product prices collected!');
        console.log(products);
        return;
    }

    if (min > maxPrice) {
        for (let i of suspectDupPrices) {
            i = i * 100;
            minPriceDifference = minPriceDifference * 100;

            const min1 = (i - minPriceDifference) / 100;
            const max1 = (i + minPriceDifference) / 100;

            minPriceDifference = minPriceDifference / 100;

            let pricesDublicates = await getPricesBetween(min1, max1);

            products = products.concat(pricesDublicates.products);
        }
        const message =
            products.length < size
                ? `${size - products.length} producsts not reached`
                : 'All product prices collected!';

        console.log(message);
        console.log(products);
        return;
    }
    let filter = 'not yet';

    let response = await getPricesBetween(min, max);
    const prices = response.products.map((x) => x.price);

    if (response.count < limit) {
        products = products.concat(response.products);
    } else {
        prices.forEach((item) => suspectDupPrices.add(item));
    }

    if (reqCount != 0) {
        filter = dynamicFilterRange(min, max, prices);
        min = filter[0];
        max = filter[1];
    } else {
        min = (min * 100 + limit * 100) / 100;
        max = (min * 100 + limit * 100 + minPriceDifference * 100) / 100;
    }

    await main();
}

async function wrap() {
    await main();
    console.log('the end');
}

wrap();
