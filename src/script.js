function greet() {
    alert('hello world: ' + localStorage.getItem('version'));
}

const messageChannel = new MessageChannel();
window.addEventListener('load', function (e) {
    navigator.serviceWorker.controller.postMessage({
        type: 'INIT_PORT'
    }, [messageChannel.port2]);
    messageChannel.port1.onmessage = function (e) {
        console.log('APP messagePort:', e);
    };
});

function sendMessage() {
    messageChannel.port1.postMessage('hello world from APP');
}