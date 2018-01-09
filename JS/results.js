//////////////////////////////////////////////////////////////////
//                           results.js                         //
//////////////////////////////////////////////////////////////////

// Display and Export Results                                   //

const results = require('./Results-Functions.js')



document.getElementById('results-refresh').addEventListener('click', function () {
    results.refreshResults()
})
