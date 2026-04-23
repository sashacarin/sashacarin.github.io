# sasha's blog

Plain HTML blog for GitHub Pages. No build step, no dependencies.

## Files

- `index.html` — home / intro
- `blog.html` — list of posts
- `media.html` — reading / listening / watching
- `media/` — MP3 files played inline on the media page
- `contact.html` — contact methods
- `posts/template.html` — copy this for new posts
- `posts/first-post.html` — example post
- `style.css` — shared styles (edit colors here)

## Add a new post

1. Copy `posts/template.html` to `posts/my-new-post.html`.
2. Edit the `<title>`, `<h1>`, date, and body.
3. Add a line to the post list in `blog.html`:
   ```html
   <li><span class="date">YYYY-MM-DD</span> <a href="posts/my-new-post.html">My new post</a></li>
   ```
4. Commit and push.

## Publish on GitHub Pages

1. Create a pseudonymous GitHub account. Set a throwaway name and email
   in `git config --local user.name` / `user.email` inside this repo so
   commits don't leak identity.
2. Create a public repo named `USERNAME.github.io` (using your pseudonym).
3. Push the contents of this folder to the `main` branch.
4. In the repo settings under **Pages**, set source to `main` / `/ (root)`.
5. Site will be live at `https://USERNAME.github.io` within a minute or two.

## Add an MP3 to the media page

1. Drop the MP3 into `media/`, e.g. `media/my-track.mp3`.
2. Drop a square album artwork image into `media/`, e.g. `media/my-art.jpg`
   (500x500 px is plenty).
3. Add a `<li>` block to the Listening section in `media.html`, copying
   one of the existing blocks. Change the `data-audio` id, the `<audio>`
   `id` (must match), the `src` paths, and the track/artist text. Example:
   ```html
   <li class="track">
     <button class="track-art" type="button" data-audio="track-3" aria-label="Play My Track">
       <img src="media/my-art.jpg" alt="">
       <span class="play-icon" aria-hidden="true"></span>
     </button>
     <div class="track-info">
       <strong>My Track</strong><br>
       Artist
     </div>
     <audio id="track-3" controls preload="none" src="media/my-track.mp3">
       <a href="media/my-track.mp3">Download MP3</a>.
     </audio>
   </li>
   ```
4. Commit and push.

The small JS at the bottom of `media.html` wires the artwork to play/pause
and flips the icon. With JS disabled, the native `<audio>` controls still
work.

Keep audio files small (128–192 kbps MP3). GitHub Pages has a 1 GB repo
cap and 100 GB/month bandwidth; files over 100 MB need Git LFS.

## Customize

- Pick a color scheme by editing `style.css` (`body` colors and `a` /
  `a:visited`). Default is black-on-white with classic blue/purple
  links.
- To go dark: set `body { color: #ddd; background: #111; }` and pick
  readable link colors.

## Out of scope (intentionally)

No comments, search, RSS, analytics, dark-mode toggle, or JS.
