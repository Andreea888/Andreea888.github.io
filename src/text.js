import { translations } from './lang.js';
import { muteMusic } from './main.js'

const workTitle = document.getElementById('work-title');
const workBody = document.getElementById('work-body');
const aboutTitle = document.getElementById('about-title');
const aboutBody = document.getElementById('about-body');


function setLanguage(lang) {
  workTitle.textContent = translations[lang].workTitle;
  workBody.innerHTML = translations[lang].workBody;
  aboutTitle.textContent = translations[lang].aboutTitle;
  aboutBody.innerHTML = translations[lang].aboutBody;
}



setLanguage('en'); 


document.getElementById('btn-en').addEventListener('click', () => setLanguage('en'));
document.getElementById('btn-ro').addEventListener('click', () => setLanguage('ro'));
document.getElementById('mute').addEventListener('click', () => muteMusic());
