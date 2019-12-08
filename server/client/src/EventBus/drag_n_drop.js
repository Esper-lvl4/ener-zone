import Emitter from 'component-emitter';

const emitter = new Emitter();

let currentZone = null;
let target = null;
let clone = null;
let targetCard = null;
let shift = null;

function getShift(event) {
  const {left, top} = event.target.getBoundingClientRect();
  return {x: event.clientX - left, y: event.clientY - top};
}

function moveElement({pageX, pageY}) {
  clone.style.top = pageY - shift.y + 'px';
  clone.style.left = pageX - shift.x + 'px';
}

function highlightZone({clientX, clientY}) {
  clone.hidden = true;
  const elementBelow = document.elementFromPoint(clientX, clientY); 
  clone.hidden = false;

  if (!elementBelow) return;

  const droppable = elementBelow.closest('.droppable');

  if (currentZone != droppable) {
    if (currentZone) {
      currentZone.classList.remove('highlight');
    }
    currentZone = droppable;
    if (currentZone) {
      currentZone.classList.add('highlight');
    }
  }
}

function startDrag (data) {
  const {event, card} = data;
  target = event.target;
  targetCard = card;
  shift = getShift(event);
  clone = target.cloneNode();
  const width = target.offsetWidth + 'px';
  const height = target.offsetHeight + 'px';

  target.hidden = true;
  document.body.appendChild(clone);
  clone.style.position = 'absolute';
  clone.style.zIndex = '1000';
  clone.style.width = width;
  clone.style.height = height;
  moveElement(event);

  document.addEventListener('mousemove', moveDrag);
  clone.addEventListener('mouseup', stopDrag);
}

function moveDrag (event) {
  moveElement(event);
  highlightZone(event);
}

function stopDrag () {
  document.removeEventListener('mousemove', moveDrag);
  clone.removeEventListener('mouseup', stopDrag);

  if (currentZone) {
    currentZone.classList.remove('highlight');
    emitter.emit('drop-card', {zone: currentZone.dataset.zoneName, under: currentZone.dataset.under});
  }
  

  clone.remove();
  currentZone = null;
  target.hidden = false;
  target = null;
  clone = null;
  targetCard = null;
  shift = null;
}

emitter.on('start-drag', startDrag);

export default emitter;