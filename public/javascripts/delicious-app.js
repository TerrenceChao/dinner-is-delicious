import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/makeMap';
import ajaxHeart from './modules/heart';

autocomplete($('#address'), $('#lat'), $('#lng'));  //use  $("#address")  if  < ... id="address" />  (in jQuery)
typeAhead( $('.search') );  //use  $(".search")  if  < ... name="search" />  (in jQuery)
makeMap( $('#map') );

const heartForms = $$('form.heart'); 
heartForms.on('submit', ajaxHeart);