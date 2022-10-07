const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const scoreEl = document.querySelector('#scoreEl')

canvas.width = innerWidth
canvas.height = innerHeight

class Boundary
{
    static height = 40;
    static width = 40;
    constructor({position, image})
    {
        this.position = position;
        this.width = 40;
        this.height = 40;
        this.image = image
    }

    draw()
    {
        // c.fillStyle = 'blue';
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)

        c.drawImage(this.image, this.position.x, this.position.y)
    }
}

// Create a player (our PACMAN)
class Player
{
    constructor({position, velocity})
    {
        this.position = position
        this.velocity = velocity
        this.radius = 15
    }

    draw()
    {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()
    }

    // moving
    update()
    {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

// Create a ghost (our enemies)
class Ghost
{
    constructor({position, velocity, color = 'red'})
    {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.color = color
        this.previousCollisions = []
    }

    draw()
    {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.color
        c.fill()
        c.closePath()
    }

    // moving
    update()
    {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

// Create a Pellet
class Pellet
{
    constructor({position})
    {
        this.position = position
        this.radius = 3
    }

    draw()
    {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }
}

const player = new Player(
    {
        position: { x:260, y:100}, // player initial position
        velocity: { x: 0, y: 0 }
    }
)
const ghosts = [ 
    new Ghost(
    {
        position: {x:540, y:540},
        velocity: {x:0.8, y:0}
    }
)
]
const pellets = []
const boundaries = []

// Keys movement (W,A,S,D)
const keys =
{
    w: 
    {
       pressed: false 
    },
    a: 
    {
       pressed: false 
    },
    s: 
    {
       pressed: false 
    },
    d: 
    {
       pressed: false 
    },
}

let lastKey = ''
let score = 0

// Generate a map
const map = 
[
    [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ','1','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','2'],
    [' ',' ',' ',' ',' ','|','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','|'],
    [' ',' ',' ',' ',' ','|','.','t','.','l','r','.','1','-','-','-','2','.','l','r','.','t','.','|'],
    [' ',' ',' ',' ',' ','|','.','|','.','.','.','.','|','.','.','.','|','.','.','.','.','|','.','|'],
    [' ',' ',' ',' ',' ','|','.','4','r','.','t','.','b','.','t','.','b','.','t','.','l','3','.','|'],
    [' ',' ',' ',' ',' ','|','.','.','.','.','|','.','.','.','|','.','.','.','|','.','.','.','.','|'],
    [' ',' ',' ',' ',' ','4','2','.','l','-','.','-','r','.','b','.','l','-','.','-','r','.','1','3'],
    [' ',' ',' ',' ',' ',' ','|','.','.','.','|','.','.','.','.','.','.','.','|','.','.','.','|',' '],
    [' ',' ',' ',' ',' ',' ','|','.','t','.','b','.','1','r',' ','l','2','.','b','.','t','.','|',' '],
    [' ',' ',' ',' ',' ',' ','|','.','|','.','.','.','|',' ',' ',' ','|','.','.','.','|','.','|',' '],
    [' ',' ',' ',' ',' ',' ','|','.','|','.','t','.','|',' ',' ',' ','|','.','t','.','|','.','|',' '],
    [' ',' ',' ',' ',' ',' ','|','.','b','.','|','.','4','-','-','-','3','.','|','.','b','.','|',' '],
    [' ',' ',' ',' ',' ',' ','|','.','.','.','|','.','.','.','.','.','.','.','|','.','.','.','|',' '],
    [' ',' ',' ',' ',' ',' ','|','.','.','.','4','-','r','.','t','.','l','-','3','.','.','.','|',' '],
    [' ',' ',' ',' ',' ',' ','|','.','t','.','.','.','.','.','|','.','.','.','.','.','t','.','|',' '],
    [' ',' ',' ',' ',' ','1','3','.','4','-','r','.','t','.','b','.','t','.','l','-','3','.','4','2'],
    [' ',' ',' ',' ',' ','|','.','.','.','.','.','.','|','.','.','.','|','.','.','.','.','.','.','|'],
    [' ',' ',' ',' ',' ','|','.','1','r','.','t','.','4','-','-','-','3','.','t','.','l','2','.','|'],
    [' ',' ',' ',' ',' ','|','.','|','.','.','|','.','.','.','.','.','.','.','|','.','.','|','.','|'],
    [' ',' ',' ',' ',' ','|','.','b','.','l','_','-','r','.','t','.','l','-','_','r','.','b','.','|'],
    [' ',' ',' ',' ',' ','|','.','.','.','.','.','.','.','.','|','.','.','.','.','.','.','.','.','|'],
    [' ',' ',' ',' ',' ','4','-','-','-','-','-','-','-','-','_','-','-','-','-','-','-','-','-','3'],
]

// Create Image function for html usage
function createImage(src)
{
    const image = new Image()
    image.src = src
    return image
}

// Add images based on the generated map above
map.forEach((row, i) =>  
{
    row.forEach((symbol, j) => 
    {
        switch(symbol)
        {
            case '-':
                boundaries.push(new Boundary
                (
                    {
                        position: {x: Boundary.width * j, y: Boundary.height * i},
                        image: createImage('image/pipeHorizontal.png')
                    }
                )
                )
                break

            case '|':
                boundaries.push(new Boundary
                (
                    {
                        position: {x: Boundary.width * j, y: Boundary.height * i},
                        image: createImage('image/pipeVertical.png')
                    }
                )
                )
                break
            case '1':
                boundaries.push(new Boundary
                (
                    {
                        position: {x: Boundary.width * j, y: Boundary.height * i},
                        image: createImage('image/pipeCorner1.png')
                    }
                )
                )
                break
            case '2':
                boundaries.push(new Boundary
                (
                    {
                            position: {x: Boundary.width * j, y: Boundary.height * i},
                            image: createImage('image/pipeCorner2.png')
                    }
                )
                )
                break
            case '3':
                boundaries.push(new Boundary
                (
                    {
                        position: {x: Boundary.width * j, y: Boundary.height * i},
                        image: createImage('image/pipeCorner3.png')
                    }
                )
                )
                break
            case '4':
                boundaries.push(new Boundary
                (
                    {
                            position: {x: Boundary.width * j, y: Boundary.height * i},
                            image: createImage('image/pipeCorner4.png')
                    }
                )
                )
                break
            case 't':
                boundaries.push(new Boundary
                (
                    {
                            position: {x: Boundary.width * j, y: Boundary.height * i},
                            image: createImage('image/capTop.png')
                    }
                )
                )
                break        
            case 'b':
                boundaries.push(new Boundary
                (
                    {
                            position: {x: Boundary.width * j, y: Boundary.height * i},
                            image: createImage('image/capBottom.png')
                    }
                )
                )
                break    
            case 'l':
                boundaries.push(new Boundary
                (
                    {
                            position: {x: Boundary.width * j, y: Boundary.height * i},
                            image: createImage('image/capLeft.png')
                    }
                )
                )
                break   
            case 'r':
                boundaries.push(new Boundary
                (
                    {
                            position: {x: Boundary.width * j, y: Boundary.height * i},
                            image: createImage('image/capRight.png')
                    }
                )
                )
                break   
            case '_':
                boundaries.push(new Boundary
                (
                    {
                            position: {x: Boundary.width * j, y: Boundary.height * i},
                            image: createImage('image/pipeConnectorTop.png')
                    }
                )
                )
                break         
            case '.':
                pellets.push(new Pellet
                (
                    {
                        position: {x: j * Boundary.width + Boundary.width / 2, y: i * Boundary.height + Boundary.height / 2},
                    }
                )
                )
                break   

        }
    })
}
)

// Predict collision with a boundary
function circleCollidewithRectangle({circle, rectangle})
{
    const padding = 20 - circle.radius - 1;
    return( (circle.position.y - circle.radius) + circle.velocity.y <= rectangle.position.y + rectangle.height + padding// Top side
         && (circle.position.x + circle.radius) + circle.velocity.x >= rectangle.position.x - padding
         && (circle.position.y + circle.radius) + circle.velocity.y >= rectangle.position.y - padding                  // Bottom side
         && (circle.position.x - circle.radius) + circle.velocity.x <= rectangle.position.x + rectangle.width + padding)
}

// Animation
function animate()
{
    requestAnimationFrame(animate) // this will stretch out the pacman forever
    // We solve that issue using clearRect
    c.clearRect(0,0, canvas.width, canvas.height)

    // Moving with WASD
    if (keys.w.pressed && lastKey === 'w') // press W
    {
        for (let i = 0; i < boundaries.length; i++)
        {
        const boundary = boundaries[i] // reference boundary
        if(circleCollidewithRectangle({circle: {...player, velocity: { x: 0, y: -1}}, rectangle: boundary}))
        {
            player.velocity.y = 0
            break;
        }
        else
            player.velocity.y = -1
        }
    }
    else if (keys.a.pressed && lastKey === 'a') // press A
    {
        for (let i = 0; i < boundaries.length; i++)
        {
        const boundary = boundaries[i] // reference boundary
        if(circleCollidewithRectangle({circle: {...player, velocity: { x: -1, y: 0}}, rectangle: boundary}))
        {
            player.velocity.x = 0
            break;
        }
        else
            player.velocity.x = -1
        }
    }
    else if (keys.s.pressed && lastKey === 's') // press S
    {
        for (let i = 0; i < boundaries.length; i++)
        {
        const boundary = boundaries[i] // reference boundary
        if(circleCollidewithRectangle({circle: {...player, velocity: { x: 0, y: 1}}, rectangle: boundary}))
        {
            player.velocity.y = 0
            break;
        }
        else
            player.velocity.y = 1
        }
    }
    else if (keys.d.pressed && lastKey === 'd') // press D
    {
        for (let i = 0; i < boundaries.length; i++)
        {
        const boundary = boundaries[i] // reference boundary
        if(circleCollidewithRectangle({circle: {...player, velocity: { x: 1, y: 0}}, rectangle: boundary}))
        {
            player.velocity.x = 0
            break;
        }
        else
            player.velocity.x = 1
        }
    }

    // We draw a square block here
    boundaries.forEach((boundary) => 
    {
        boundary.draw()

        // Stop the player from going out of the map
        if (circleCollidewithRectangle({circle: player, rectangle: boundary}))
        {
        player.velocity.y = 0
        player.velocity.x = 0
        }
    })

    // We update and draw a player --> moving
    player.update()


    // Create Pellet
    for (let i = pellets.length - 1; 0 < i; i--) // Remove the flashy light everytime pacman eats a pallet
    {
        const pellet = pellets[i]
        pellet.draw()
        // Pellet disappear if collides with Pacman
        if (Math.hypot(pellet.position.x - player.position.x, pellet.position.y - player.position.y) < pellet.radius + player.radius)
         {
            pellets.splice(i, 1)
            score += 10
            scoreEl.innerHTML = score
         }  
    }


    // Create enemies/ghosts
    ghosts.forEach((ghost) => {
        ghost.update()

        // Detect collisions:
        const collisions = []
        boundaries.forEach((boundary) => {
            if(!collisions.includes('right') &&
                circleCollidewithRectangle({circle: {...ghost, velocity: { x: 1, y: 0}}, rectangle: boundary}))
            {
                collisions.push('right')
            }
            else if(!collisions.includes('left') &&
                circleCollidewithRectangle({circle: {...ghost, velocity: { x: -1, y: 0}}, rectangle: boundary}))
            {
                collisions.push('left')
            }
            else if(!collisions.includes('up') &&
                circleCollidewithRectangle({circle: {...ghost, velocity: { x: 0, y: -1}}, rectangle: boundary}))
            {
                collisions.push('up')
            }
            else if(!collisions.includes('down') &&
                circleCollidewithRectangle({circle: {...ghost, velocity: { x: 0, y: 1}}, rectangle: boundary}))
            {
                collisions.push('down')
            }
        })

        if (collisions.length > ghost.previousCollisions.length)
        {ghost.previousCollisions = collisions}

        if (JSON.stringify(collisions) !== JSON.stringify(ghost.previousCollisions))
        {
            if (ghost.velocity.x > 0) ghost.previousCollisions.push('right')
            else if (ghost.velocity.x < 0) ghost.previousCollisions.push('left')
            else if (ghost.velocity.y < 0) ghost.previousCollisions.push('up')
            else if (ghost.velocity.y > 0) ghost.previousCollisions.push('down')

            const pathways = ghost.previousCollisions.filter((collision) => {
                return !collisions.includes(collision)
            })

            const direction = pathways[Math.floor(Math.random() * pathways.length)]

            // Make ghost move randomly using switch case
            switch (direction)
            {
                case 'down':
                    ghost.velocity.y = 1
                    ghost.velocity.x = 0
                    break
                case 'up':
                    ghost.velocity.y = -1
                    ghost.velocity.x = 0
                    break
                case 'left':
                    ghost.velocity.y = 0
                    ghost.velocity.x = -1
                    break
                case 'right':
                    ghost.velocity.y = 0
                    ghost.velocity.x = 1
                    break
            }

            ghost.previousCollisions = []
        }
    })
}

animate()

// player moves when you push the button
addEventListener('keydown', ({key}) => 
{
    switch(key)
    {
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            break
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break
    }
}
)

// Player stops moving when you release the button
addEventListener('keyup', ({key}) => 
{
    switch(key)
    {
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
    }
}
)