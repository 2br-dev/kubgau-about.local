import Hogan from 'hogan.js';
import FacultiesExplorer, { IFaculties } from './lib/faculties';
import M from 'materialize-css';
import Swiper from 'swiper';
import {Autoplay, Pagination} from 'swiper/modules';

let facultyData: IFaculties;
let explorer: FacultiesExplorer;
let selectedForm:string;

Swiper.use([Pagination, Autoplay]);

const facultyTpl = `
{{#faculties}}
<details class="faculty-wrapper">
	<summary class="faculty-header">
		<div class="name">
			<h3>{{faculty}}</h3>
		</div>
		<div class="extra">
			<span class="count">{{total}}</span>
			<i class="icon i-chevron-down"></i>
		</div>
	</summary>

	<div class="details-content">
		<div class="forms-wrapper">
			{{#forms}}
				<div class="row flex">
				{{#directions}}
					<div class="col l4 m6 s12">
						<div class="direction-card">
							<hgroup class="speciality">
								<h4>{{name}}</h4>
								<p>{{direction}}</p>
							</hgroup>
							<div class="description">{{description}}</div>
							<div class="points">
								<ul>
									{{#points}}
										<li>
											<i class="icon i-{{icon}}"></i>
											<span>{{text}}</span>
										</li>
									{{/points}}
								</ul>
							</div>
						</div>
					</div>
				{{/directions}}
				</row>
			{{/forms}}
		</div>
	</div>
</details>
{{/faculties}}
`

const sidenav = M.Sidenav.init(document.querySelectorAll('.sidenav'), {
	edge: 'right'
})

document.addEventListener('DOMContentLoaded', () => {
	
	initExplorer();
	
	// Переключатель для компонентов
	document.querySelectorAll('.tabber-switcher a').forEach(el => {
		const switcher = el as HTMLLinkElement;
		switcher.addEventListener('click', switchComponent);
	})

	// Отображение поинтов на карте
	document.querySelectorAll('#map dt').forEach((point:Element) => {
		point.addEventListener('click', openPoint);
	})

	document.querySelectorAll('#map dd a').forEach((closer:Element) => {
		closer.addEventListener('click', closePoint);
	})

	const dpoSwiperEl = document.querySelector('#swiper-dpo') as HTMLElement;
	if(dpoSwiperEl){
		const swiperDpo = new Swiper(dpoSwiperEl, {
			spaceBetween: 20,
			loop: true,
			speed: 800,
			autoplay: {
				delay: 8000,
				pauseOnMouseEnter: true
			},
			pagination: {
				el: '#dpo-pagination',
				type: 'bullets',
				clickable: true,
				dynamicBullets: true,
				dynamicMainBullets: 3
			},
			breakpoints: {
				400: {
					slidesPerView: 1
				},
				850: {
					slidesPerView: 2
				},
				1200: {
					slidesPerView: 3
				},
				1800: {
					slidesPerView: 2
				}
			}
		})
	}

	document.querySelectorAll('.sidenav a').forEach(el => {
		el.addEventListener('click', e => sidenav[0].close())
	})

	$('body').on('click', '.scroll-link', (e) => {
		e.preventDefault();
		const el = e.currentTarget;
		const hash = new URL(el.href).hash;
		const top = $(hash).offset()?.top;

		$('html, body').animate({
			scrollTop: top
		}, 'fast');
	})
})

function openPoint(e:Event)
{
	const el = e.currentTarget as HTMLElement;
	const nextEl = el.nextElementSibling;
	document.querySelectorAll('#map dd').forEach(point => point.classList.remove('open'));
	nextEl?.classList.add('open');
}

function closePoint(e:Event)
{
	e.preventDefault();
	document.querySelectorAll('#map dd').forEach(point => point.classList.remove('open'));
}

function switchComponent(e:MouseEvent)
{
	e.preventDefault();
	const el = e.currentTarget as HTMLLinkElement;
	const hash = new URL(el.href).hash;
	const targetEl = document.querySelector(hash);

	document.querySelectorAll('.tabber-content').forEach(el => {
		el.classList.remove('active');
	})

	document.querySelectorAll('.tabber-switcher a').forEach(el => {
		el.classList.remove('active');
	})

	targetEl?.classList.add('active');
	el.classList.add('active');
}

function initExplorer()
{
	explorer = new FacultiesExplorer();
	
	explorer.fetch().then((data) => {
	
		facultyData = data;
	
		// Читаем исходное значение
		const typeSelector = document.querySelectorAll("[name='type-selector']");
		const checkedType = document.querySelector("[name='type-selector']:checked") as HTMLInputElement;
		
		if(typeSelector.length){
			selectedForm = checkedType.value;
			const filteredData = explorer.filterFormType(explorer.cloneDataArray(facultyData), selectedForm);
			render(filteredData);
		}
		typeSelector.forEach((el:Element) => {
			el.addEventListener('change', switchForm);
		});
	
		// Текстовый поиск
		const searchEl = document.querySelector('#search') as HTMLInputElement;
		if (searchEl){
			searchEl.addEventListener('input', facultySearch);
		}
	});
}

function facultySearch(e:Event)
{
	if(facultyData.faculties && selectedForm != "")
	{
		
		const el = e.currentTarget as HTMLInputElement;
		const val = el.value;
		
		if(val.trim() !== ""){
			const clone = explorer.cloneDataArray(facultyData);
			const filteredClone = explorer.filterFormType(clone, selectedForm);
			const data = explorer.search(filteredClone, val);
			render(data);
		}else{
			if(explorer.sourceData !== null){
				const clone = explorer.cloneDataArray(explorer.sourceData);
				const filteredClone = explorer.filterFormType(clone, selectedForm);
				const data = explorer.prepareData(filteredClone.faculties);
				render(data);
			}
		}
	}
}

function render(data:IFaculties)
{

	const emptyPlaceholder = `
	<div class="empty">
		<h3>К сожалению, нам не удалось найти, что вы искали! :(</h3>
		<p>Попробуйте изменить поисковой запрос, если вы уверены, что это ошибка, пожалуйста, сообщите администратору, и мы постараемся исправить её</p>
	</div>
	`
	const outputContainer = document.querySelector('#education-content');
	if(outputContainer){
		let output;
		if(data.faculties.length > 0){
			const tpl = Hogan.compile(facultyTpl);
			output = tpl.render(data);
		}else{
			output = emptyPlaceholder;
		}
		outputContainer.innerHTML = output;
	}
}

function switchForm(e:Event){
	const el = e.currentTarget as HTMLInputElement;
	const value = el.value;
	selectedForm = value;

	const clone = explorer?.cloneDataArray(facultyData);
	const result = explorer?.filterFormType(clone, value);
	render(result);
}