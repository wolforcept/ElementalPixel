
function start(element) {

    document.getElementById('initial').classList.add('hidden');
    document.getElementById('percentages').classList.remove('hidden');

    const poll = {};
    const canvas = document.getElementById('canvas');
    canvas.classList.remove("hidden");
    const ctx = canvas.getContext('2d');
    const ws = new WebSocket('wss://localhost');
    // const ws = new WebSocket('wss://elementalpixelserver.onrender.com');

    let lastDirection = "left";
    let lastMessage;

    window.addEventListener('keydown', ({ key }) => poll[key] = true);
    window.addEventListener('keyup', ({ key }) => poll[key] = false);

    setInterval(() => {

        let keyPressed = false, dx = 0, dy = 0;

        if (poll['ArrowUp']) {
            dy = -1;
            keyPressed = true;
            // send({ type: "move", dx: 0, dy: -1 });
            lastDirection = "up";
        }
        if (poll['ArrowDown']) {
            dy = 1;
            keyPressed = true;
            // send({ type: "move", dx: 0, dy: 1 });
            lastDirection = "down";
        }
        if (poll['ArrowLeft']) {
            dx = -1;
            keyPressed = true;
            // send({ type: "move", dx: -1, dy: 0 });
            lastDirection = "left";
        }
        if (poll['ArrowRight']) {
            dx = 1;
            keyPressed = true;
            // send({ type: "move", dx: 1, dy: 0 });
            lastDirection = "right";
        }
        if (keyPressed) {
            send({ type: "move", dx, dy });
        }

        if (poll['q']) {
            send({ type: "action1", dir: lastDirection });
        }
        if (poll['w']) {
            send({ type: "action2", dir: lastDirection });
        }
        if (poll['e']) {
            send({ type: "action3", dir: lastDirection });
        }
        if (poll['r']) {
            send({ type: "action4", dir: lastDirection });
        }

    }, 1000 / 20);

    function send(msg) {
        ws.send(JSON.stringify(msg));
    }

    ws.onopen = () => {
        ws.send(`{"type":"init","element":"${element}"}`)
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

            document.getElementById("coord").innerHTML = message.player.x + "," + message.player.y;
            document.getElementById("waterPercent").innerHTML = message.percentages[0] + "%";
            document.getElementById("earthPercent").innerHTML = message.percentages[1] + "%";
            document.getElementById("firePercent").innerHTML = message.percentages[2] + "%";
            document.getElementById("airPercent").innerHTML = message.percentages[3] + "%";


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
            case "earth": return "#188b48";
            case "fire": return "#c42408";
            case "air": return "#fffeaf";
            case "w": return "#0044FF";
            case "e": return "#188b48";
            case "f": return "#c42408";
            case "a": return "#fffeaf";
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
