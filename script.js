'use strict';

const btnCont = document.querySelector('.btn-cont');
const infoCont = document.querySelector('.info-cont');

let searchUrlParameter;

const setSearchUrl = (event) => {
    const eventObj = event.target;

    if(eventObj.classList.contains('btn-forces')){
        searchUrlParameter = 'forces';
        return;
    }

    if(eventObj.classList.contains('btn-street')){
        searchUrlParameter = 'crimes-street/all-crime?';
        return;
    }

    if(eventObj.classList.contains('btn-searches')){
        searchUrlParameter = 'stops-street?';
        return;
    }

    if(eventObj.classList.contains('btn-categories')){
        searchUrlParameter = 'crime-categories?';
        return;
    }
}

//getting user's current latitude and longitude 
//Geolocaton API - https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
const getCurrLocation = () => {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const currLongitude = position.coords.longitude;
                const currLatitude = position.coords.latitude;

                fetchData(currLongitude, currLatitude, undefined);
            },
            () => alert('Could not get your current location')
        );
    }
}

//getting current date ('year-month' format required for police API)
const getCurrDate = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    fetchData(undefined, undefined, `${year}-${month}`);
}

const refreshUI = () => {
    infoCont.innerHTML = '';
}

const updateUI = (dataObj, propHeading1, propHeading2, optionalProp1, optionalProp2) => {
    refreshUI(); 

    if(searchUrlParameter === 'crimes-street/all-crime?'){
        dataObj.forEach(curr => infoCont.insertAdjacentHTML('beforeend', 
            `
            <div class="info-box column">
                <h1>${curr[propHeading1]}</h1>

                <h2>${curr[propHeading2][optionalProp1][optionalProp2]}</h2>
            </div> 
            `
        ));

        return;
    }

    dataObj.forEach(curr => infoCont.insertAdjacentHTML('beforeend', 
        `
        <div class="info-box column">
            <h1>${curr[propHeading1]}</h1>

            <h2>${curr[propHeading2]}</h2>
        </div> 
        `
    ));
}

//async fetching from police API
const fetchData = async (longitude, latitude, date) => {
    //street-level crimes and stop&search both use longitude and latitude in fetch query
    if(searchUrlParameter === 'crimes-street/all-crime?' || searchUrlParameter === 'stops-street?'){
        try {
            const response = await fetch(`https://data.police.uk/api/${searchUrlParameter}lat=${latitude}&lng=${longitude}`);
            const data = await response.json();
            
            if(searchUrlParameter === 'crimes-street/all-crime?'){
                updateUI(data, 'category', 'location', 'street', 'name');
            } else {
                updateUI(data, 'officer_defined_ethnicity', 'type', undefined, undefined);
            } 
        } catch(error) {
            console.log(error);
        }

        return;
    }

    //crime categories uses date in fetch query
    if(searchUrlParameter === 'crime-categories?'){
        try {
            const response = await fetch(`https://data.police.uk/api/crime-categories?date=${date}`);
            const data = await response.json();
            updateUI(data, 'name', 'url', undefined, undefined);

        } catch(error) {
            console.log(error);
        }

        return;
    }

    //forces list is a constant fetch query
    try {
        const response = await fetch('https://data.police.uk/api/forces');
        const data = await response.json();
        updateUI(data, 'id', 'name', undefined, undefined);
    } catch(error) {
        console.log(error);
    }
}



btnCont.addEventListener('click', (e) => {
    setSearchUrl(e);

    //street-level crimes or stop and searches (both use lat/lng)
    if(e.target.classList.contains('btn-street') || e.target.classList.contains('btn-searches')){
        getCurrLocation();
        return;
    }

    //crime categories
    if(e.target.classList.contains('btn-categories')){
        getCurrDate();
        return;
    }

    //forces list
    fetchData(undefined, undefined, undefined);
})


//4btns (update ui each click): 
//list of forces 
//street level crimes
//stop and searches
//crime categories