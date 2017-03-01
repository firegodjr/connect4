var isGameOver = false;
var isBlueTurn = false;
var isRedTurn = false;
var useBlueAI = false;
var useRedAI = false;
var aiAggressiveness = 1;  //Anything above 1 causes the AI to become more aggressive in blocking the other player's winning move and completing its own four-in-a-row, but subsequently becomes less interested in strategy as it doesn't care as much when it finds a winning move that isn't immediately accessible
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
function renderBoard()
{
	//Theme the board
	if(theme == NORMAL)
	{
		var table = document.getElementById("gametbl");
		table.style.backgroundColor = "yellow";
		table.style.borderRadius = "5px";
		table.style.backgroundImage = "";
		table.style.animation = "none";
	}
	else if(theme == DOGE)
	{
		var table = document.getElementById("gametbl");
		table.style.backgroundColor = "yellow";
		table.style.borderRadius = "5px";
		table.style.backgroundImage = "";
		table.style.animation = "none";
	}
	else if(theme == CHRISTMAS)
	{
		var table = document.getElementById("gametbl");
		table.style.backgroundColor = "yellow";
		table.style.borderRadius = "5px";
		table.style.backgroundImage = "url('pics/bgxmas.jpg')";
		table.style.animation = "none";
	}
	else if(theme == CHALLENGE)
	{
		var table = document.getElementById("gametbl");
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
			renderBoard();
			declareWinner(checkForWin(board)[0]);
			if(useRedAI) document.getElementById("aiout").innerHTML = "The AI is thinking...";
			setTimeout(setupRedTurn, 100);
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
			renderBoard();
			declareWinner(checkForWin(board)[0]);
			if(useBlueAI) document.getElementById("aiout").innerHTML = "The AI is thinking...";
			setTimeout(setupBlueTurn, 100);
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

/* Sets up the elements for the Blue player's turn. */
function setupBlueTurn()
{
	var i;
	if(!isGameOver)
	{
		for(i = 0; i < 7; i++)
		{
			var el = document.getElementById("col" + i);
			el.innerHTML="<img src='pics/downarrowblue.png' width='43' height='43' />";
		}
	}
	else
	{
		var el = document.getElementById("btntbl");
	}
	
	isBlueTurn = true;
	if(useBlueAI)
	{
		document.getElementById("aiout").innerHTML = "The AI is thinking...";
		getAIMove(BLUE);
	}
	else
	{
		renderBoard();
	}
}

/* Sets up the elements for the Blue player's turn. */
function setupRedTurn()
{
	var i;
	if(!isGameOver)
	{
		for(i = 0; i < 7; i++)
		{
			var el = document.getElementById("col" + i);
			el.innerHTML="<img src='pics/downarrowred.png' width='43' height='43' />";
		}
	}
	else
	{
		var el = document.getElementById("btntbl");
	}
	
	isRedTurn = true;
	if(useRedAI)
	{
		document.getElementById("aiout").innerHTML = "The AI is thinking...";
		getAIMove(RED);
	}
	else
	{
		renderBoard();
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
			isGameOver = true;
		}
		else if(team == RED)
		{
			el.innerHTML = "<tr><td>RED WINS</td></tr>";
			isGameOver = true;
		}
		else
		{
			el.innerHTML = "<tr><td>GAME OVER</td></tr>";
			isGameOver = true;
		}
	}	
}

/* Simply checks if the input is a number and then sets the theme to said number. */
function changeThemeByNumber(num)
{
	if(!isNaN(num))
	{
		theme = num;
	}
	renderBoard();
}

function getOtherColor(color)
{
	if(color == RED)
		return BLUE;
	else return RED;
}

//Performs a minimax function to get the move with the minimum amount of losses
var moveScores = new Array(7);
var sandbox = new Array(10);
function getAIMove(color)
{
	if(!isGameOver)
	{
		moveScores = new Array(7);
		for(var i = 0; i < 7; i++)
		{
			moveScores[i] = 0;
		}
		
		resetSandbox(sandbox);
		
		var totalIterations = 0;
		for(var i = 0; i < 7; i++)
		{
			if(tryAddCoin(sandbox, color, i)) 
			{
				var winner = checkForWin(sandbox);
				if(winner[0] == color)						//If it can win in one move, prioritize it
				{
						moveScores[i] += 2401*aiAggressiveness;
				}
				else for(var j = 0; j < 7; j++)
				{
					if(tryAddCoin(sandbox, getOtherColor(color), j))
					{
						var winner = checkForWin(sandbox);
						if(winner[0] == getOtherColor(color))	//If the other player can win in one move, prioritize it
						{
								moveScores[i] -= 343*aiAggressiveness;
						}
						else for(var k = 0; k < 7; k++)
						{
							if(tryAddCoin(sandbox, color, k))
							{
								var winner = checkForWin(sandbox);
								if(winner[0] == color)	//If the other player can win in one move, prioritize it
								{
										moveScores[i] += 49;
								}
								else for(var l = 0; l < 7; l++)
								{
									if(tryAddCoin(sandbox, getOtherColor(color), l))
									{
										var winner = checkForWin(sandbox);
										if(winner[0] == getOtherColor(color))	//If the other player can win in one move, prioritize it
										{
												moveScores[i] -= 7*aiAggressiveness;
										}
										else for(var m = 0; m < 7; m++)
										{
											totalIterations++;
											if(tryAddCoin(sandbox, color, m)) 
											{
												var winner = checkForWin(sandbox);
												for(var windex = 0; windex < winner.length; winner++)
												{
													if(winner[windex] == color)
													{
														moveScores[i] += 1;
													}
													else if(winner[windex] == getOtherColor(color))
													{
														moveScores[i] -= 1*aiAggressiveness;
													}
												}
												removeCoin(sandbox, m);
											}
										}
										removeCoin(sandbox, l);
									}
								}
								removeCoin(sandbox, k);
							}
						}
						removeCoin(sandbox, j);
					}
				}
				removeCoin(sandbox, i);
			}
		}
		document.getElementById("aiout").innerHTML = moveScores + "<br />Total Iterations:" + totalIterations;
		
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
		handleClick(moveIndex);
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
		setupBlueTurn();
	}
}
