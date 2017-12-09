//////////////////////////////////////////////////////////////////
//                          main-menu.js                        //
//////////////////////////////////////////////////////////////////

// Set up main menu and links between screens                   //

// Set Up Welcome Screen
document.getElementById('download-output').setAttribute('style', 'display:none;')
document.getElementById('entries').setAttribute('style', 'display:none;')
document.getElementById('download-menu').setAttribute('style', 'display:none;')
document.getElementById('main-menu').setAttribute('style', 'display:block;')
document.getElementById('back').setAttribute('style', 'display:none;')

// If Download Clicked
document.getElementById('menu-download').addEventListener('click', function () {
    document.getElementById('download-output').setAttribute('style', 'display:block;')
    document.getElementById('entries').setAttribute('style', 'display:none;')
    document.getElementById('download-menu').setAttribute('style', 'display:block;')
    document.getElementById('main-menu').setAttribute('style', 'display:none;')
    document.getElementById('back').setAttribute('style', 'display:block;')
})

// If Entries Clicked
document.getElementById('menu-entries').addEventListener('click', function () {
    document.getElementById('download-output').setAttribute('style', 'display:none;')
    document.getElementById('entries').setAttribute('style', 'display:block;')
    document.getElementById('download-menu').setAttribute('style', 'display:none;')
    document.getElementById('main-menu').setAttribute('style', 'display:none;')
    document.getElementById('back').setAttribute('style', 'display:block;')
})

// If Back Clicked
document.getElementById('back').addEventListener('click', function () {

    //If port is still open close it
    if (document.getElementById('download-output').getAttribute('style') == 'display:block;') {
        if (document.getElementById('connect').innerText == 'Disconnect') {
            port.close();
        }
    }

    document.getElementById('download-output').setAttribute('style', 'display:none;')
    document.getElementById('entries').setAttribute('style', 'display:none;')
    document.getElementById('download-menu').setAttribute('style', 'display:none;')
    document.getElementById('main-menu').setAttribute('style', 'display:block;')
    document.getElementById('back').setAttribute('style', 'display:none;')

})
