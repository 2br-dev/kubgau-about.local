export interface IPoint{
	icon: string,
	text: string
}

export interface IDirection{
	name: string,
	direction: string,
	description: string,
	points: IPoint[]
}

export interface IForm{
	name: string,
	directions: IDirection[]
}

export interface IFaculty{
	faculty: string,
	forms: IForm[],
	total?: number
}

export interface IFaculties{
	faculties: IFaculty[];
}

class FacultiesExplorer
{

	// public facultyData:IFaculties | null = null;
	// public facultyDataClone:IFaculties | null = null;
	public onDataReady: (data:IFaculties) => void = (data:IFaculties) => {};
	public sourceData:IFaculties | null = null;

	public async fetch()
	{
		const response = await fetch('./tulip-2026/data/faculties.json');
		const data = await response.json();
		this.sourceData = data;
		return data;
	}

	public filterFormType(data:IFaculties, selectedForm:string)
	{
		const filteredData = data.faculties.map((faculty: IFaculty) => ({
			...faculty,
			forms: faculty.forms.filter((form:IForm) => form.name === selectedForm)
		})).filter(faculty => faculty.forms.length > 0)

		return this.prepareData(filteredData);
	}

	public prepareData(faculties:IFaculty[])
	{
		const preparedData = faculties.map((faculty:IFaculty) => {
			const totalCount = faculty.forms.reduce((sum, form) => sum+form.directions.length, 0)

			return {
				...faculty,
				total: totalCount
			}
		})

		return {
			faculties: preparedData
		}
	}

	public search(data: IFaculties, query: string) {
		const lowerQuery = query.toLowerCase();

		const filteredFaculties = data.faculties
			.map((faculty: IFaculty) => {
				// 1. Проверяем, совпадает ли название самого факультета
				const isFacultyMatch = faculty.faculty.toLowerCase().includes(lowerQuery);

				// 2. Фильтруем формы и направления
				const filteredForms = faculty.forms.map((form: IForm) => {
					const filteredDirections = form.directions.filter((direction: IDirection) =>
						direction.name.toLowerCase().includes(lowerQuery)
					);

					return { ...form, directions: filteredDirections };
				});

				// 3. Считаем, есть ли хоть одно совпадение в направлениях
				const hasMatchingDirections = filteredForms.some(form => form.directions.length > 0);

				// ЛОГИКА ВЫВОДА:
				if (isFacultyMatch) {
					// Если совпал факультет — возвращаем его целиком (оригинальный объект)
					return faculty;
				} else if (hasMatchingDirections) {
					// Если совпали только направления — возвращаем факультет с отфильтрованными формами
					return { ...faculty, forms: filteredForms.filter(f => f.directions.length > 0) };
				}

				// Если совпадений нет ни в названии, ни в направлениях
				return null;
			})
			.filter((f): f is IFaculty => f !== null); // Убираем пустые результаты

		return this.prepareData(filteredFaculties);
	}

	public cloneDataArray(data:IFaculties)
	{
		return structuredClone(data);
	}
}

export default FacultiesExplorer;