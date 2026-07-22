/*
 * Headspace feed data — the living page of updates.
 *
 * HOW TO ADD A POST (on my end, then push):
 *   1. Drop the photo/video into  film/headspace/
 *   2. Add an entry to the array below, or use the composer:
 *      open  headspace.html?edit=1  , fill the form, then Copy / Download.
 *   3. Commit + push. The public page only ever shows the rendered feed.
 *
 * Entry shape (single):   { date, type ("image"|"video"), src, caption?, alt? }
 * Entry shape (multiple): { date, media: [ { type, src, alt? }, ... ], caption? }
 * Entries render in chronological order — oldest first, most recent at the bottom.
 * Use \n in a caption for a line break.
 *
 * LISTEN WITH ME — shows currently playing track only (cover / song / artist).
 * Populated by data/spotify-now.json via .github/workflows/spotify-now.yml.
 * No profile link — the widget is hidden when nothing is playing.
 */
window.HEADSPACE_LISTEN = {
    label: "now playing",
    nowPlayingUrl: "data/spotify-now.json"
};

window.HEADSPACE_FEED = [
        {
            date: "2026-01-03",
            type: "image",
            src: "film/headspace/IMG_1112.JPG",
            caption: "reunited with my high school badminton family! from rivals, teammates, strangers, we're a lot older now but just as silly on the courts...",
            alt: ""
        },
        {
            date: "2026-01-08",
            type: "image",
            src: "film/headspace/IMG_5854.jpg",
            caption: "got my film developed today with aimee! the pictures are the whimsiest glimpses of my life. wouldnt trade this for the world.",
            alt: "his fob is my job or whatever"
        },
        {
            date: "2026-02-21",
            media: [
                { type: "image", src: "film/headspace/IMG_8783 2.jpg" },
                { type: "image", src: "film/headspace/IMG_8804.PNG" }
            ],
            caption: "gt sweeps at emory open!\nXD advanced gold! \nWD advanced bronze lmao!"
        },
        {
            date: "2026-03-07",
            media: [
                { type: "image", src: "film/headspace/IMG_6997.JPG" },
                { type: "image", src: "film/headspace/IMG_1646.JPG" }
            ],
            caption: "my dance team performed at three festivals this year. each of them was so fun! this is definitely my favorite dance. and it'll be my last year leading this team :')"
        },
        {
            date: "2026-03-22",
            type: "image",
            src: "film/headspace/IMG_1871.JPG",
            caption: "went to umich to play at UMICH OPEN SPRING 26. \n- matched with a random mixed player who ended up being a really good fit! we got knocked out in semis A but that's honestly pretty good.\n- medaled in Women's Doubles B! took home silver.",
            alt: ""
        },
        {
            date: "2026-04-10",
            type: "image",
            src: "film/headspace/IMG_2355.JPG",
            caption: "we made it to chicago in one piece! minus our player who forgot his contacts and played blind. 16th in the country! not bad at all.",
            alt: "we went to nationals!"
        },
        {
            date: "2026-04-24",
            media: [
                { type: "image", src: "film/headspace/IMG_0749.jpg" },
                { type: "image", src: "film/headspace/IMG_2508.JPG" },
                { type: "image", src: "film/headspace/IMG_2512.JPG" }
            ],
            caption: "my id minor captsone project complete! we 3d modeled an entire teahouse experience and built out Abigail's cute little calligraphy room. it was awesome. ty to everyone who helped us out at hive!"
        },
        {
            date: "2026-04-26",
            media: [
                { type: "video", src: "film/headspace/MVI_2585.mov" },
                { type: "video", src: "film/headspace/IMG_8376 2.MOV" },
                { type: "image", src: "film/headspace/IMG_2579 2.JPG" }
            ],
            caption: "omg we finally finished rhythm hop. so much soldering, struggling, and jumping, but we made it. our very own diy DDR machine."
        },
        {
            date: "2026-05-07",
            media: [
                { type: "image", src: "film/headspace/IMG_3121.JPG" },
                { type: "image", src: "film/headspace/IMG_3418.JPG" }
            ],
            caption: "i graduated! undergrad was honestly a blur but so fun. masters here we come!"
        }
];
