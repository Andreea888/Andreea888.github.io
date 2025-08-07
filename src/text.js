import { translations } from './lang.js';
import { muteMusic } from './main.js'


const workTitle = document.getElementById('work-title');
const workBody = document.getElementById('work-body');
const aboutTitle = document.getElementById('about-title');
const aboutBody = document.getElementById('about-body');

var click = new Howl({
 src: ["./music/click.ogg"],
 loop: false,
 volume: 1,
});

function setLanguage(lang) {
  workTitle.textContent = translations[lang].workTitle;
  workBody.innerHTML = translations[lang].workBody;
  aboutTitle.textContent = translations[lang].aboutTitle;
  aboutBody.innerHTML = translations[lang].aboutBody;
}



setLanguage('en'); 
const isMobile = navigator.userAgent.includes("Mobi");

if(!isMobile){
  document.getElementById('btn-en').addEventListener('click', 
    () => {
      setLanguage('en')
      click.play();
    });
  document.getElementById('btn-ro').addEventListener('click', 
    () => {
      setLanguage('ro')
      click.play();
    });
  document.getElementById('mute').addEventListener('click', 
    () => {
      muteMusic()
      click.play();
    });
}
else{
  document.getElementById('btn-en').addEventListener('touchend', 
    () => {
      setLanguage('en')
      click.play();
    });
  document.getElementById('btn-ro').addEventListener('touchend', 
    () => {
      setLanguage('ro')
      click.play();
    });
  document.getElementById('mute').addEventListener('touchend', 
    () => {
      muteMusic()
      click.play();
    });
}
