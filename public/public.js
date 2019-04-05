import io from 'socket.io-client'
window.socket =  io('/main-menu', {
  query: {
    token: localStorage.getItem('EnerZoneToken'),
  },
});