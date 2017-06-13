function autocomplete(input, latInput, lngInput) {

    if (!input) return; //skip this func from running if there's not input on the page.

    console.log(input, latInput, lngInput);

    //google maps API link is in 'layout.pug'
    const dropdown = new google.maps.places.Autocomplete(input);
    dropdown.addListener('place_changed', () => {
        const place = dropdown.getPlace();
        // console.log(place);
        latInput.value = place.geometry.location.lat();
        lngInput.value = place.geometry.location.lng();
    });

    /**
     * http://keycode.info/  check the keyboard's key code.
     * if someone hits 'enter' on the address field, 
     * don't submit the form.
     */
    input.on('keydown', (e) => {
        if(e.keyCode == 13) e.preventDefault();
    });
}

export default autocomplete;