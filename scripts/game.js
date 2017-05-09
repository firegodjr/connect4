var debug = false;

var AI_ANSWER_HEAD = "aimv;"
var AI_DEBUG_HEAD = "aidbg;"

var isGameOver = false;
var isBlueTurn = false;
var isRedTurn = false;
var useBlueAI = false;
var useRedAI = false;
var aiDepth = 4;  //Sets AI iteration depth
var BLANK = 0;
var BLUE = 1;
var RED = 2;

//God has forsaken us
var theme = 0;
var NORMAL = 0;
var DOGE = 1;
var CHRISTMAS = 2;
var CHALLENGE = 3;

//The board is arrayed X,Y - but the elements are
//	indexed with Y,X, so keep that in mind
//Also don't use resetGame() here or it'll break
var board = new Array(10);
for(var i = 0; i < 10; i++)
{
	board[i] = new Array(9);
	for(var j = 0; j < 9; j++)
	{
		board[i][j] = BLANK;
	}
}

/* Assign background colors and other css elements to each
game element based on theme */
function renderBoard(board)
{
	var table = document.getElementById("gametbl");
	//Theme the board
	if(theme == NORMAL)
	{
		table.style.backgroundColor = "yellow";
		table.style.borderRadius = "5px";
		table.style.backgroundImage = "";
		table.style.animation = "none";
	}
	else if(theme == DOGE)
	{
		table.style.backgroundColor = "yellow";
		table.style.borderRadius = "5px";
		table.style.backgroundImage = "";
		table.style.animation = "none";
	}
	else if(theme == CHRISTMAS)
	{
		table.style.backgroundColor = "yellow";
		table.style.borderRadius = "5px";
		table.style.backgroundImage = "url('pics/bgxmas.jpg')";
		table.style.animation = "none";
	}
	else if(theme == CHALLENGE)
	{
		table.style.animation = "slowspin 2s infinite";
	}

	//Theme the coins
	for(var i = 0; i < 6; i++) //For each row
	{
		for(var j = 0; j < 7; j++) //For each column
		{
			var el = document.getElementById(i + "," + j);

			el.style.backgroundColor = getClr(board[j][i]);

			if(theme == NORMAL)
			{
				el.style.backgroundColor = getClr(board[j][i]);
				el.style.backgroundImage = "";
			}
			else if(theme == DOGE)
			{
				if(board[j][i] == BLUE)
				{
					el.style.backgroundImage = "url('pics/bluedoge.gif')";
				}
				else if(board[j][i] == RED)
				{
					el.style.backgroundImage = "url('pics/reddoge.gif')";
				}
				else
				{
					el.style.backgroundColor = "white";
				}
			}
			else if(theme == CHRISTMAS)
			{
				if(board[j][i] == BLUE)
				{
					el.style.backgroundImage = "url('pics/bluexmas.png')";
				}
				else if(board[j][i] == RED)
				{
					el.style.backgroundImage = "url('pics/redxmas.png')";
				}
				else
				{
					el.style.backgroundColor = "white";
				}
			}
		}
	}

}

/* Takes an int argument and returns the string of the color's name */
function getClr(player)
{
	if(player == BLUE)
	{
		return "blue";
	}
	else if(player == RED)
	{
		return "red";
	}
	else
	{
		return "white";
	}
}

/* Is triggered every time a down-arrow is clicked */
function handleClick(col)
{
	if(isBlueTurn)
	{
		if(tryAddCoin(board, BLUE, col))
		{
			var row = getNextOpenSlot(board, col);
			document.getElementById((row+1) + "," + col).style.backgroundColor = getClr(BLUE);
			document.getElementById((row+1) + "," + col).style.animation = "fall" + row + " 1s";
			isBlueTurn = false;
			declareWinner(checkForWin(board)[0]);
			if(useRedAI) document.getElementById("aiout").innerHTML = "The AI is thinking...";
			setupTurn(RED);
			renderBoard(board);
		}
	}
	else if(isRedTurn)
	{
		if(tryAddCoin(board, RED, col))
		{
			var row = getNextOpenSlot(board, col);
			document.getElementById((row+1) + "," + col).style.backgroundColor = getClr(RED);
			document.getElementById((row+1) + "," + col).style.animation = "fall" + row + " 1s";
			isRedTurn = false;
			declareWinner(checkForWin(board)[0]);
			if(useBlueAI) document.getElementById("aiout").innerHTML = "The AI is thinking...";
			setupTurn(BLUE);
			renderBoard(board);
		}
	}
}

/* Iterates through the column and finds the closest unfilled slot. If there isn't one, returns -1 */
function getNextOpenSlot(sandbox, col)
{
	for(var i = 5; i >= 0; i--)
	{
		if(sandbox[col][i] == BLANK)
		{
			return i;
		}
	}
	return -1;
}

/* Attempts to add a coin to the column, and if successful, returns true. If the column is full, returns false. */
function tryAddCoin(sandbox, player, col)
{
	var row = getNextOpenSlot(sandbox, col);

	if(row != -1)
	{
		sandbox[col][row] = player;
		return true;
	}
	else
	{
		return false;
	}
}

/* Sets up the elements for the Blue player's turn. */
function setupTurn(color)
{
	var i;
	if(!isGameOver)
	{
		for(i = 0; i < 7; i++)
		{
			var el = document.getElementById("col" + i);
			el.innerHTML="<img src='pics/downarrow" + getClr(color) + ".png' width='43' height='43' />";
		}
	}

	if(color == RED)
	{
		isRedTurn = true;
	}
	else
	{
		isBlueTurn = true;
	}

	if((color == BLUE && useBlueAI) || (color == RED && useRedAI))
	{
		document.getElementById("aiout").innerHTML = "The AI is thinking...";
		aiw.postMessage("brd" + JSON.stringify(board));
		aiw.postMessage("mov" + color);
	}
}

/* Checks for a winner by taking a root element and checking for each possible winning coin arrangement. If it finds one, it sets the winning arrangement to have a pulsing animation and then returns the root element. */
function checkForWin(sandbox)
{
	var winner = new Array (0);
	for(var i = 0; i < 7; i++)
	{
		for(var j = 0; j < 6; j++)
		{
			//Check vertical win
			if(sandbox[i][j] != BLANK
				&& sandbox[i][j]==sandbox[i][j+1]
				&& sandbox[i][j]==sandbox[i][j+2]
				&& sandbox[i][j]==sandbox[i][j+3])
			{
				winner.push(sandbox[i][j]);
			}
			//Check horizontal win
			else if(sandbox[i][j] != BLANK
				&& sandbox[i][j]==sandbox[i+1][j]
				&& sandbox[i][j]==sandbox[i+2][j]
				&& sandbox[i][j]==sandbox[i+3][j])
			{
				winner.push(sandbox[i][j]);
			}
			//Check down-right diagonal
			else if(sandbox[i][j] != BLANK
				&& sandbox[i][j] == sandbox[i+1][j+1]
				&& sandbox[i][j] == sandbox[i+2][j+2]
				&& sandbox[i][j] == sandbox[i+3][j+3])
			{
				winner.push(sandbox[i][j]);
			}
			//Check up-right diagonal
			else if(sandbox[i][j] != BLANK
				&& sandbox[i][j] == sandbox[i+1][j-1]
				&& sandbox[i][j] == sandbox[i+2][j-2]
				&& sandbox[i][j] == sandbox[i+3][j-3])
			{
				winner.push(sandbox[i][j]);
			}
		}
	}
  if(winner.length <= 0)
  {
    winner.push(BLANK);
  }
	return winner;
}

/* Announces to the user who won */
function declareWinner(team)
{
	if(team != BLANK)
	{
		//TODO: pulse winner

		//Show header
		var el = document.getElementById("btntbl");
		if(team == BLUE)
		{
			el.innerHTML = "<tr><td>BLUE WINS</td></tr>";
		}
		else if(team == RED)
		{
			el.innerHTML = "<tr><td>RED WINS</td></tr>";
		}
		else
		{
			el.innerHTML = "<tr><td>GAME OVER</td></tr>";
		}

		if(aim !== "undefined")
		{
			aim.postMessage("go" + isGameOver);
		}

		isGameOver = true;
	}
}

/* Simply checks if the input is a number and then sets the theme to said number. */
function changeThemeByNumber(num)
{
	if(!isNaN(num))
	{
		theme = num;
	}
	renderBoard(board);
}

/* Creates a WebWorker which finds and returns a new AI move */
var aiw;
function startAIWorker()
{
	if(typeof(Worker !== "undefined"))
	{
		if(typeof(aiw) == "undefined")
		{
			aiw = new Worker("scripts/worker.js");
		}

		aiw.postMessage("aim" + aiDepth);

		aiw.onmessage = function(e)
		{
			var message = e.data;
			if(message.startsWith("dbg"))
			{
				document.getElementById("aiout").innerHTML = message.replace("dbg", "");
			}
			else if(message.startsWith("mov"))
			{
				handleClick(parseInt(message.replace("mov", "")));
			}
		}
	}
}

function stopAIWorker()
{
	aiw.terminate();
	aiw = undefined;
}


function resetGame()
{
	board = new Array(10);
	for(var i = 0; i < 10; i++)
	{
		board[i] = new Array(9);
		for(var j = 0; j < 9; j++)
		{
			board[i][j] = BLANK;
		}
	}
	isGameOver = false;
	document.getElementById("btntbl").innerHTML = '<tr><td id="col0" onclick="handleClick(0);"></td><td id="col1" onclick="handleClick(1);"></td><td id="col2" onclick="handleClick(2);"></td><td id="col3" onclick="handleClick(3);"></td><td id="col4" onclick="handleClick(4);"></td><td id="col5" onclick="handleClick(5);"></td><td id="col6" onclick="handleClick(6);"></td><td id="col7" onclick="handleClick(7);"></td></tr>'
	setupTurn(BLUE);
}
