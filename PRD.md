## Overview:

- Create a browser based asteroids clone
- Use HTML, Javascript, CSS on the frontend
- Deploy to Github Pages
	- Run tests in Github Actions
	- Only deploy if tests pass
- Use Supabase for the backend and API
- Split the work into incremental tracer bullet tasks

## Mandatory Acceptance Criteria:

As a user can I:
- Learn about the game before logging in
- Log in using just my Email
	- have my data protected by not storing the email in plain text
	- override a placeholder display name with my own
- See a tile grid of 100 numbered game levels
	- Select the first level and play the game
		- Enjoy a classic asteroids style game experience
  		- Have a single life to complete the level
  		- Expect each level to feature 1 waves of targets/enemies
			- Use arrow keys and spacebar to control the gameplay
		- Unlock the next level by completing the current one
			- Find levels increasingly difficult with more/faster rocks, enemy ships
		- Return to the level select screen if I complete or fail each level
	- Replay levels I have already completed
		- Have my new best time stored if I beat the previous best
	- See my best completion time in seconds on the grid tile
	- See the top 10 completion times for a level by clicking a leaderboard icon on each tile
	- Be unable to abuse the API to post false completion/times

As a dev can I:
- Log in using 'dev@example.com' to bypass the Email auth
  - Still have my results stored in Supabase
