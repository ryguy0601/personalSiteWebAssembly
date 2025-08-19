namespace personalSiteWebAssembly.Helpers
{
    public class PageInfo
    {
        public string Type { get; set; } = "Game"; // Game, Project, Blog, Other
        public string Title { get; set; } = "Default Title";
        public string Description { get; set; } = "Lorem ipsum dolor sit amet.";
        public string Path { get; set; } = "/";
        public string Image { get; set; } = "";
        public string ImageAlt { get; set; } = "Image Alt";
        public string BtnText { get; set; } = "Default Btn Txt";
        public string GithubUrl { get; set; } = "https://github.com/ryguy0601";
    }

    public class WebPages
    {
        private readonly List<PageInfo> _pageLst = new();

        public WebPages()
        {
            _pageLst.Add(new PageInfo()
            {
                Type = "Game",
                Title = "2048",
                Description = "Combine tiles until you reach 2048.",
                Path = "/games/new2048",
                BtnText = "Play 2048",
                GithubUrl = "https://github.com/ryguy0601/2048"
            });

            _pageLst.Add(new PageInfo()
            {
                Type = "Project",
                Title = "Image Converter",
                Description = "Bulk convert and compress large image files.",
                Path = "/projects/imgConverter",
                BtnText = "Go To Image Converter"
            });

            _pageLst.Add(new PageInfo()
            {
                Type = "AboutMe",
                Title = "Resume",
                Description = "A quick mention of my education and work experience.",
                Path = "/AboutMe/Resume",
                BtnText = "Read Resume"
            });

            _pageLst.Add(new PageInfo()
            {
                Type = "Game",
                Title = "Block Blast (WIP)",
                Description = "Work in progress",
                Path = "/games/BlockBlast",
                BtnText = "Play Block Blast"
            });
        }

        public List<PageInfo> GetPages() => _pageLst;
    }
}
