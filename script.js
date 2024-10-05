function start() {

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const ws = new WebSocket('wss://elementalpixelserver.onrender.com');

    let lastDirection = "left";
    let lastMessage;

    window.addEventListener('keydown', ({ key }) => {
        if (key === 'ArrowUp') {
            send({ type: "move", dx: 0, dy: -1 });
            lastDirection = "up";
        } else if (key === 'ArrowDown') {
            send({ type: "move", dx: 0, dy: 1 });
            lastDirection = "down";
        } else if (key === 'ArrowLeft') {
            send({ type: "move", dx: -1, dy: 0 });
            lastDirection = "left";
        } else if (key === 'ArrowRight') {
            send({ type: "move", dx: 1, dy: 0 });
            lastDirection = "right";
        } else if (key === 'q') {
            send({ type: "action1", dir: lastDirection });
        } else if (key === 'w') {
            send({ type: "action2", dir: lastDirection });
        } else if (key === 'e') {
            send({ type: "action3", dir: lastDirection });
        } else if (key === 'r') {
            send({ type: "action4", dir: lastDirection });
        } else {
            // console.log(key);
        }
    });

    function send(msg) {
        ws.send(JSON.stringify(msg));
    }
    ws.onopen = () => {
        ws.send(`{"type":"init","element":"water"}`)
    }

    ws.onmessage = (unparsedMessage) => {
        // console.log(`message received`, unparsedMessage.data);

        try {
            const message = JSON.parse(unparsedMessage.data);
            lastMessage = message;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            renderWorld(message.world);

            message.players.forEach(player => {
                const relX = player.x - message.player.x;
                const relY = player.y - message.player.y;
                if (relX < 20 && relX >= -20 && relY < 20 && relY >= -20)
                    renderPlayer(relX, relY, player.element);
            });

            renderPos(0, 0, "#FFFFFF55")

            document.getElementById("coord").innerHTML = message.player.x + "," + message.player.y

        } catch (e) {
            console.log(e);
        }

    }

    function renderWorld(world) {
        let i = 0;
        for (let dx = -20; dx <= 20; dx++) {
            for (let dy = -20; dy <= 20; dy++) {
                renderPos(dx, dy, getColor(world[i]));
                i++;
            }
        }
    }

    function getColor(element) {
        switch (element) {
            case "water": return "#0044FF";
            case "w": return "#0033AA";
            case "a": return "#AA0000";
            case "s": return "#00AA00";
            case "d": return "#AAAAAA";
            case "0": return "#FF0000";
        }
        // let i = element.charCodeAt(0) - 12;
        // return "#" + i + i + i;
        return "#000000"
    }

    function renderPlayer(x, y, element) {
        let color = getColor(element);
        renderPos(x, y, color)
    }

    function renderPos(x, y, color, w = 1, h = 1) {
        if (color) ctx.fillStyle = color;
        x += canvas.width / 2;
        y += canvas.height / 2;
        ctx.fillRect(x, y, w, h);
    }

}

start();