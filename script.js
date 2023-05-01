import Grid from "./grid.js"
import Tile from "./tile.js"

const gameBoard = document.getElementById("game-board") 
const scorediv = document.getElementById("score")
const lostdiv = document.querySelector(".lost")
const namediv = document.getElementById("nameInput")
const buttonsubmit = document.querySelector(".submit")
const buttonsavescore = document.getElementById("savescore")
const savescorepage = document.getElementById("savescorepage")
const buttonleaderboard = document.getElementById("leaderboard")
const leaderboardpage = document.getElementById("leaderboardpage")
const scoregrid = document.querySelector(".score_grid")
const menudiv = document.getElementById("menu")

const grid = new Grid(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
var score = 0
var newsave = false
scorediv.innerHTML = score
setupInput()
loadLeaderboard()

function setupInput() {
    window.addEventListener("keydown", handleInput, { once: true})
    
}

buttonsavescore.addEventListener("click", () => {
        if(savescorepage.classList.contains("hidden")){
            savescorepage.classList.remove("hidden")
            savescorepage.classList.add("animate")
        }
        else {
            savescorepage.classList.add("hidden")
            savescorepage.classList.remove("animate")
        }
})

buttonleaderboard.addEventListener("click", () => {
    if(leaderboardpage.classList.contains("hidden")){
        leaderboardpage.classList.remove("hidden")
        leaderboardpage.classList.add("animate")
        if(newsave == true){
            loadLeaderboard()
        }
        
    }
    else {
        leaderboardpage.classList.add("hidden")
        leaderboardpage.classList.remove("animate")
    }
})


buttonsubmit.addEventListener("click" , () => {
    setCookie(namediv.value, ""+score, 1)
    newsave = true
})

function loadLeaderboard() {
    var isfirst = true
    getCookie().forEach(element => {
        if(isfirst == false) {
            const ndiv = document.createElement("div")
            scoregrid.append(ndiv)
            let name = element.split("=")[0]
            ndiv.innerHTML = name
            const sdiv = document.createElement("div")
            scoregrid.append(sdiv)
            let sc = element.split("=")[1]
            sdiv.innerHTML = sc
            newsave = false
        }
        else {
            isfirst = false
        }
        
    })
}

function getCookie() {
    const cDecoded = decodeURIComponent(document.cookie)
    const cArray = cDecoded.split("; ") 
    return cArray
}


function setCookie(name, value, daysToLive) {
    const date = new Date()
    date.setTime(date.getTime() + daysToLive * 24 * 60 * 60 * 1000)
    let expires = "expires="+date.toUTCString();
    document.cookie = `${name}=${value}; ${expires}`
}

function deleteAllCookies() {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

async function handleInput(e) {
    switch (e.key) {
        case "ArrowUp":
            if (!canMoveUp()) {
                setupInput()
                return
            }
            await moveUp()

            break
        case "ArrowDown":
            if (!canMoveDown()) {
                setupInput()
                return
            }
            await moveDown()
            break
        case "ArrowLeft":
            if (!canMoveLeft()) {
                setupInput()
                return
            }
            await moveLeft()
            break
        case "ArrowRight":
            if (!canMoveRight()) {
                setupInput()
                return
            }
            await moveRight()
            break
        default:
            setupInput()
            return
    }

    grid.cells.forEach((cell) => {
        cell.mergeTiles()
        if(cell.mergeTiles) {
            score = score + cell.scoreg
            scorediv.innerHTML = score
        }
        
        
    } 
        )
    

    const newTile = new Tile(gameBoard)
    grid.randomEmptyCell().tile = newTile

    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
        newTile.waitForTransition(true).then(() => {
            lostdiv.classList.remove("hidden")
            lostdiv.classList.add("animate")
            menudiv.style.backgroundColor = "#fff"
        })
        return
    }

    setupInput()
}

function moveUp() {
    return slideTiles(grid.cellsByColumn)
}

function moveDown() {
    return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()))
}

function moveLeft() {
    return slideTiles(grid.cellsByRow)
}

function moveRight() {
    return slideTiles(grid.cellsByRow.map(row => [...row].reverse()))
}


function slideTiles(cells) {
    return Promise.all(
        cells.flatMap(group => {
            const promises = []
            for (let i = 1; i<group.length; i++) {
                const cell = group[i]
                if(cell.tile == null) continue
                let lastValidCell
                for (let j = i-1; j>=0; j--){
                    const moveToCell = group[j]
                    if(!moveToCell.canAccept(cell.tile)) break
                    lastValidCell = moveToCell
                }
                if (lastValidCell != null) {
                    promises.push(cell.tile.waitForTransition())
                    if (lastValidCell.tile != null) {
                        lastValidCell.mergeTile = cell.tile
                    } else {
                        lastValidCell.tile = cell.tile
                    }
                    cell.tile = null
                }
            }
            return promises
        })
    )
}

function canMoveUp() {
    return canMove(grid.cellsByColumn)
}

function canMoveDown() {
    return canMove(grid.cellsByColumn.map(column => [...column].reverse()))
}

function canMoveLeft() {
    return canMove(grid.cellsByRow)
}

function canMoveRight() {
    return canMove(grid.cellsByRow.map(row => [...row].reverse()))
}

function canMove(cells) {
    return cells.some(group => {
        return group.some((cell, index) => {
            if (index === 0) return false
            if (cell.tile == null) return false
            const moveToCell = group[index - 1]
            return moveToCell.canAccept(cell.tile)
        })

    })
}