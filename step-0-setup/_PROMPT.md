Research and work only inside this folder

Create a wave defence game similar to the ones created on flash

A welcome screen should display showing if you want a tutorial of the game

After that they can then be taken on the screen displaying a diffrent game mode that they can choose i.e normal gameplay with a diffrent map of their choice with various difficulties from easiet to hardest

There should be a loadout that is displayed at the bottom of the screen filled with five slots, each slot can be comprised with different towers of your choosing

Each tower is unqiue and does something different

To be able to purchase these towers their should be a shop on the side to click on then shows which list of towers you can buy

To buy them you need coins and to get these coins you have to beat the map and survive all the waves

Each diffculty depends on how many waves there is with lowest diffculty having the lowest amount of waves and the highest having the most amount of waves

The waves should be a minimum of 25 with the maximum being 40

If the player fails or beats the map there should be an end screen

The end screen should either have a "You lost" screen if the player fails the map or a "You win" if the player beats the map

After failing or winning the map there should be an option to either retry the map or return to the gamemode screen

For the in-depth analysis the layout should go like this

Main Menu (Tutorial Yes/No)
Level Select (Choose Map + Choose Difficulty)
Loadout Selection (Pick 5 towers from your collection)
Game Start

Then after the tutorial should follow this dynamic

The Mechanic: Lock all buttons except the ones you want the player to click.
The Flow: Pulse the "Shop" button -> Force the player to buy a specific tower -> Show a ghost image of where to place it -> Spawn a single slow enemy. High-level game engines (and Flash games of the past) use a "State Machine" to handle this so the player can't break the game by clicking elsewhere.

For the pathing of the enemies it should

Instead of just a background image, each map needs an underlying array of coordinates (e.g., [[0,50], [100,50], 

[100,200]]).
The Logic: Enemies shouldn't just "move right"; they should move toward the next coordinate in the list. When they reach point A, they head to point B. This prevents them from getting stuck in the corners.

As of the wave structure and towers it should have this

Easy (25 Waves): Enemy health increases by 10% per wave.
Hard (40 Waves): Enemy health increases by 20% per wave + faster move speeds.
The Loadout: Since you have 5 slots, ensure your 5 starting towers cover different "roles":
The Scout: Low cost, fast fire, low damage.
The Sniper: High cost, slow fire, high damage/long range.
The Slower: Magic or Ice that reduces enemy speed.
The Splash: Cannon/Bomb for groups of weak enemies.
The Support: A tower that buffs the range of others nearby.

As of the visual layout it should have this

Area	Description
Top Bar	Lives, Wave Count (
𝑋
/
40
X/40), and Current Coins.
Center	The Map (with the path clearly drawn).
Right Side	The Shop (Icons with prices). Information on selected towers appears here.
Bottom Bar	Your 5-slot Loadout. Clicking here selects the tower to "plant" on the map.
