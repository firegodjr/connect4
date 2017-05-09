var BLANK = 0;
var BLUE = 1;
var RED = 2;

var aiDepth = 4;
var isGameOver = false;


var board = new Array(10);
for(var i = 0; i < 10; i++)
{
	board[i] = new Array(9);
	for(var j = 0; j < 9; j++)
	{
		board[i][j] = BLANK;
	}
}

/*
  Receives: color
  Returns: moveIndex
*/
self.onmessage = function(e)
{
  var message = e.data;
  if(message.startsWith("aim"))
  {
    aiDepth = parseInt(message.replace("aim", ""))
  }
  else if(message.startsWith("go"))
  {
    isGameOver = parseInt(message.replace("go", "") == "true" ? true : false);
  }
  else if(message.startsWith("brd"))
  {
    board = JSON.parse(message.replace("brd", ""));
  }
  else if(message.startsWith("mov"))
  {
    var moveIndex = getAIMove(parseInt(message.replace("mov", "")), board, aiDepth);
    self.postMessage("mov" + moveIndex);
  }
}

/* Performs a recursive minimax function to find the AI's next move */
function analyzeNextPotentialMove(rootindex, loopamnt, depth, sandbox, basecolor, color)
{
		var winner = checkForWin(sandbox);
		if(winner[0] == basecolor)						//If it can win in one move, prioritize it
		{ //Just add the score as if it checked every time
			moveScores[rootindex] += Math.pow(loopamnt, depth);
			return;
		}
		else if(winner[0] == getOtherColor(basecolor))
		{
			moveScores[rootindex] -= Math.pow(loopamnt, depth);
			return;
		}

	if(depth > 0)
	{
		for(var i = 0; i < loopamnt; ++i)
		{
			if(tryAddCoin(sandbox, getOtherColor(color), i))
			{
				analyzeNextPotentialMove(rootindex, loopamnt, depth-1, sandbox, basecolor, getOtherColor(color));
				removeCoin(sandbox, i);
			}
		}
	}
	else
	{
		++totalIterations;
	}
}

/* Finds the next move for the AI */
var moveScores = new Array(7);
var sandbox = new Array(10);
var totalIterations = 0;
function getAIMove(color, board, aiDepth)
{
	if(!isGameOver)
	{
		moveScores = new Array(7);
		for(var i = 0; i < 7; i++)
		{
			moveScores[i] = 0;
		}

		resetSandbox(sandbox);

		totalIterations = 0;
		for(var i = 0; i < 7; i++)
		{
			if(tryAddCoin(sandbox, color, i))
			{
				analyzeNextPotentialMove(i, 7, aiDepth, sandbox, color, color, totalIterations);
				removeCoin(sandbox, i);
			}
		}
		self.postMessage("dbg" + moveScores + "<br />Total Iterations:" + totalIterations);

		var moveIndex = 0;
		for(var i = 0; i < 7; i++)
		{
			if(getNextOpenSlot(board, i) != -1)
			{
				moveIndex = i;
			}
		}
		var highest = moveScores[moveIndex];
		var indicesToPick = new Array(0);
		for(var i = 0; i < moveScores.length; i++)
		{
			if(moveScores[i] > highest)
			{
				if(getNextOpenSlot(board, i) != -1)
				{
					highest = moveScores[i];
					moveIndex = i;
					indicesToPick = [];
				}
			}
			if(moveScores[i] == highest)
			{
				indicesToPick.push(i);
			}
		}

		if(indicesToPick.length > 0)
		{
		  moveIndex = indicesToPick[parseInt(Math.random()*indicesToPick.length)];	//Pick one of the equal indices at random
		}
		return moveIndex;
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

//Resets the AI sandbox to the board's current state
function resetSandbox(sandbox)
{
	for(var i = 0; i < 10; i++)
	{
		sandbox[i] = new Array(9);
		for(var j = 0; j < 9; j++)
		{
			sandbox[i][j] = board[i][j];
		}
	}
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

/* Removes the top coin in the column */
function removeCoin(sandbox, col)
{
	var row = getHighestCoin(sandbox, col);

	if(row != -1)
	{
		sandbox[col][row] = BLANK;
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

function getOtherColor(color)
{
	if(color == RED)
		return BLUE;
	else return RED;
}

/* Iterates through the column and finds the highest filled slot. If there isn't one, returns -1 */
function getHighestCoin(sandbox, col)
{
	for(var i = 0; i < 6; i++)
	{
		if(sandbox[col][i] != BLANK)
		{
			return i;
		}
	}
	return -1;
}
