/*
  Part of BrutusNext

  Event handlers attached directly to 'document'
*/

document.oncontextmenu = (event: MouseEvent) =>
{
  // Disable opening of context menu on right click for
  // whole document.
  event.preventDefault();
};