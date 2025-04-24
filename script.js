const API_KEY = "62db472545f5819db7f11785b7d76cf0";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_SRC_BASE = `https://image.tmdb.org/t/p/w500`;


/* {
    id:string;
    poster_path:string
    title:string
    vote_average:number
}*/
const state = {
    mvList:[],
    likedList:[],
    currentTab:"Home",
    totalPage:1,
    currentPage:1,
    currentSelect: "popular",
    viewMvDetail:null
}


async function fetchMVData(){
    const url = `${BASE_URL}/movie/${state.currentSelect}?page=${String(state.currentPage)}&api_key=${API_KEY}`
    return fetch(url).then((res) => {
        if(res.status === 200){
            return res.json()
        }else{
            return []
        }
    })
}

async function fetchMVDetailData(id){
    const url = `${BASE_URL}/movie/${id}?api_key=${API_KEY}`;
    return fetch(url).then((res) => {
        if(res.status === 200){
            return res.json()
        }else{
            return void 0
        }
    })
}

async function setMVData(){
    const moivesInfo =  await fetchMVData() 
    state.mvList = moivesInfo.results;
    state.totalPage = moivesInfo.total_pages;
}

async function changeCurrentSelect(id){
    
    state.currentSelect = id
    selectBar_2.value = state.currentSelect
    state.currentPage = 1;
    if(state.currentTab === "Home" ) state.mvList = []
    await renderPage()
}

async function changeCurrentTab(id){
    state.currentTab = id;
    state.currentPage = 1;
    if(state.currentTab !== "Home" ){
        state.totalPage = 1;
    } else{
        state.mvList = []
    }
    await renderPage()
}

async function changeCurrentPage(p){
    if(state.currentTab !== "Home") return
    if(state.currentPage + p > 0 && state.currentPage + p <= state.totalPage ){
        state.currentPage += p
        state.mvList = []
    }

    await renderPage()
}

async function changeLike(id) {
    const card = id.closest(".card");
    if (!card) return;
    const movieId = card.id; 
    const isLiked = state.likedList.some(mv => String(mv.id) === movieId);
    if (isLiked) {
        state.likedList = state.likedList.filter(mv => String(mv.id) !== movieId);
    } else {
        const movie = state.mvList.find(mv => String(mv.id) === movieId);
        state.likedList.push({ ...movie });
    }
    await renderPage()
}

async function changeViewMvDetail(id){
    const card = id.closest(".card");
    if (!card) return;
    const movieId = card.id; 
    const mvDetail = await fetchMVDetailData(movieId);
    if(!mvDetail) return;
    state.viewMvDetail = mvDetail;
    await renderPage()
}

async function closeViewMvDetail(id){
    state.viewMvDetail = null;
    const detailContainer = document.getElementById("mv-detail-container");
    detailContainer.className = "hidden"
    await renderPage()
}

async function createMovieCardWithDetail(){
    const viewMv = state.viewMvDetail;
    const detailContainer = document.getElementById("mv-detail-container");
    detailContainer.className = "show"
    detailContainer.innerHTML = "";
    const mvDetailHTML = `
        <div class="mv-detail">
            <i class="icon ion-close-round"></i>
            <div class="mv-detail-body">
                <img class = "mv-detail-poster" src = "${IMG_SRC_BASE}/${viewMv.poster_path}" />
                <div class = "mv-de"> 
                    <div class="mv-detail-title"> ${viewMv.title} </div>
                    <br />
                    <div class = "overview"> 
                        <span class = "mv-detail-subtitle"> Overview </span>
                        <p class = "mv-detail-overview"> ${viewMv.overview} </p>
                    </div>
                    <br />
                    <div class = "genres"> 
                        <span class = "mv-detail-subtitle"> Genres </span>
                        <div class = "mv-detail-genres">
                        ${viewMv.genres.map((genre) => {
                            return `<span class = "mv-detail-genre"> ${genre.name} </span>`
                        })}  
                        </div>
                    </div>
                    <br />
                    <div class = "rating"> 
                        <span class = "mv-detail-subtitle"> Rating </span>
                        <p class = "mv-detail-rating"> ${viewMv.vote_average} </p>
                    </div>
                    <br />
                    <div class = "production-companies"> 
                        <div class = "mv-detail-subtitle"> Production companies </div>
                        <div class = "mv-detail-companies">
                            ${viewMv.production_companies.map((company) => {
                                return `<img class = "mv-detail-company" src = "${IMG_SRC_BASE}/${company.logo_path}" />`
                            })}  
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
    detailContainer.innerHTML = mvDetailHTML
}

function createMovieCard(movie){
    const newDiv = document.createElement("div");
    const like = state.likedList.find(e => e.id === movie.id)
    newDiv.id = movie.id;
    newDiv.className = "card"
    const cardHTML = `
        <div>
            <img class = "poster" src=${IMG_SRC_BASE}${movie.poster_path} />
        </div>
        <h3 class = "mv-title">
            ${movie.title}
        </h3>
        <div class = "card-detail">
            <div>
                <i class="icon ion-star"></i>
                <div>${movie.vote_average}</div>
            </div>
            <i class = "like-icon ${like ? "ion-ios-heart" : "ion-ios-heart-outline"}"></i>
        </div>
    `
    newDiv.innerHTML = cardHTML
    return newDiv
}


function createMovieCardList(){
    const listContainer = document.querySelector('.list-container');
    listContainer.innerHTML = '';
    const currentViewList = state.currentTab === "Home" ? state.mvList : state.likedList;
    currentViewList.forEach(movie => {
        const card = createMovieCard(movie)
        listContainer.append(card);
    })
}

function renderCOP(){
    const pageInfo = document.getElementById("page-info")
    pageInfo.textContent = `${state.currentPage} / ${state.totalPage}`
}

function renderSelect(){
    const page = document.querySelectorAll("#tabs-bar li button")
    const select = document.querySelectorAll("#select-bar li button")

    page.forEach(e => {
        if(e.id === state.currentTab) e.className = "select"; 
        else e.className = "no-select"
    })

    select.forEach(e => { 
        if(e.id === state.currentSelect) e.className = "select";
        else e.className = "no-select";
    })

}

async function renderPage(){
    if(state.mvList.length === 0) await setMVData();
    if(state.viewMvDetail !== null) await createMovieCardWithDetail()
    createMovieCardList();
    renderCOP();
    renderSelect();
}


const selectBar = document.getElementById("select-bar")
const navBar = document.getElementById("tabs-bar")
const pageBar = document.getElementById("page-navigation-bar")
const selectBar_2 = document.getElementById("filter-select")
const cardSelector = document.querySelector(".list-container")
const closeBtn = document.getElementById("mv-detail-container")

selectBar.addEventListener("click", (e) => {
    if(e.target.tagName === "BUTTON") changeCurrentSelect(e.target.id)
})

navBar.addEventListener("click", (e) => {
    if(e.target.tagName === "BUTTON") changeCurrentTab(e.target.id)
})

pageBar.addEventListener("click",(e) => {
    if(e.target.id === "prev")  changeCurrentPage(-1)
    else if(e.target.id === "next") changeCurrentPage(1)
})

selectBar_2.addEventListener("click", (e) => {
    changeCurrentSelect(e.target.value)
})

cardSelector.addEventListener("click", async (e) =>{
    if(e.target.classList.contains("like-icon")) changeLike(e.target);
    else if(e.target.className === "mv-title") changeViewMvDetail(e.target)
})

closeBtn.addEventListener("click", (e) => {
    if(e.target.classList.contains("ion-close-round")) closeViewMvDetail(e.target)
})

renderPage()
