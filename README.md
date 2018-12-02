# ener-zone
Online client for Wixoss TCG. 

Change list.
  
v.0.0.3
- Done making authentication and authorization.
  - Sign Up.
  - Login.
  - Logout.
  - Authorization.
    - All parts of app are not available, if you're not authenticated. Except for /auth.
    - For now I'm storing token in the localStorage.
    - I wrote redirections on frontend. Maybe will change that later on.

v.0.0.2
- Created client side structure:
  - Main menu.
  - Deck editor.
  - Lobby.
  - Game.
- Done programming Deck editor.
  - Now it gets all cards from database
  - Can filter through all the cards by:
    - name.
    - color.
    - level.
    - limit.
    - power.
    - limiting condition.
    - use timing.
    - etc.
  - Can save decks, and load decks. Though it will be updated, when I implement registration and users.
  - Can delete decks.

  v.0.0.1
- Wrote wixoss-wiki parser.
- Got all cards stored in MongoDB.
- Can now get cards from database in brawser.
    
    
