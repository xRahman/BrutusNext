There is a central (bare) repository for the BrutusNext project, initially
located at /home/rahman/repository/BrutusNext.git

To clone a working copy of it use (it will create a BrutusNext subdirectory):

git clone /home/rahman/repository/BrutusNext.git


To access the central repository from the outside (via ssh) use:
rahman@brutus/home/rahman/repository/BrutusNext.git


Commiting changes to your local repository:
--------------------------------------------

// To review your changes:
git status

// To add new files to the commit if you addes some:
git add <file>

// To commit:
git commit -a

Pulling and pushing from/to the central repository
---------------------------------------------------

git pull
git push

(you have an 'origin' repository alias set by your original 'git clone'
command so you don't need to specify what do you want to pull from / push to).