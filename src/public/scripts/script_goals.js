const dailyGoalsList = document.querySelector('#dailyGoalsList');
const weeklyGoalsList = document.querySelector('#weeklyGoalsList');
const weekly_goal_input = document.querySelector('#weekly_goals_input');
const daily_goal_input = document.querySelector('#daily_goals_input');


weekly_goal_input.addEventListener('keydown', async (event) => {
    if (event.key !== 'Enter') 
        return;
    newGoal(weekly_goal_input, weeklyGoalsList)
});
weeklyGoalsList.addEventListener('click', async (event) => {
    if (!event.target.classList.contains('deleteWeeklyGoal'))
        return;
    deleteGoal(event, weeklyGoalsList);
});


daily_goal_input.addEventListener('keydown', async (event) => {
    if (event.key !== 'Enter') 
        return;
    newGoal(daily_goal_input, dailyGoalsList)
});

dailyGoalsList.addEventListener('click', async (event) => {
    if (!event.target.classList.contains('deleteDailyGoal'))
        return;
    deleteGoal(event, dailyGoalsList);
})

function getServerURL(goal_type, action){
    if (goal_type == 'weeklyGoalsList') {
        if (action == 'new') {
            return '/weekly_goals/new'
        }
        if (action == 'delete') {
            return '/weekly_goals'
        }
    }
    if (goal_type == 'dailyGoalsList') {
        if (action == 'new') {
            return '/daily_goals/new'
        }
        if (action == 'delete') {
            return '/daily_goals'
        }
    }
}
function createLi(data, goalList) {
    let type = null
    
    console.log(goalList.id)
    console.log(goalList)

    if (goalList.id == 'dailyGoalsList'){
        type = 'daily_goals'
    } else if (goalList.id == 'weeklyGoalsList'){
        type = 'weekly_goals'
    }

    const status = data.status;
    const text = data.weekly_goals || data.daily_goals;

    const template = document.createElement('template');
    template.innerHTML = `
        <li data-id="${data.id}" class="flex group font-medium text-3xl text-wrap tracking-widest text-branco">
            <svg data-type="${type}" xmlns="http://www.w3.org/2000/svg" class="group-has-[a:hover]:text-red-800 mt-1.5 mx-2 text-branco"
                width="21" height="21" viewBox="0 0 24 24">
                <g id="not_completed" fill="currentColor">
                    <path d="M5 21q-.825 0-1.413-.588T3 19V5q0-.825.588-1.413T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.588 1.413T19 21H5Zm0-2h14V5H5v14Z"/>
                </g>
            </svg>
            <span class="${status ? 'line-through ' : ''}group-has-[a:hover]:line-through group-has-[a:hover]:text-red-800 group-has-[input:hover]:line-through">
                ${text}
            </span>
            <a class="${type === 'weekly_goals' ? 'deleteWeeklyGoal' : 'deleteDailyGoal'} hover:cursor-pointer hover:text-opacity-100 text-red-800 text-opacity-0 group-has-[span:hover]:text-opacity-100 no-underline text-4xl font-extrabold">x</a>
            </li>
        `;

    const li = template.content.firstElementChild;
    li.querySelector('svg').addEventListener('click', function () {
        change_status_goal(data.id, this);
    });

    return li;
}

async function newGoal(goalInput, goalList) {
    const value = goalInput.value.trim();
    if (!value) return;

    const serverURL = getServerURL(goalList.id, 'new')

    const response = await fetch(serverURL, {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            value
        })
    });

    const data = await response.json();
    
    const li = createLi(data, goalList)

    const lastElement = goalList.lastElementChild
    goalList.insertBefore(li, lastElement);

    goalInput.value = '';
}


async function change_status_goal(id, el){
    const type = el.dataset.type 
    const response = await fetch(`/${type}/switch/${id}`, {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            id
        })
    });

    update_visualy_status_goal(el)
}

function update_visualy_status_goal(svg_el){
    const li = svg_el.closest('li');
    const span = li.querySelector('span');

    const g_path_completed = `
        <g id="completed" fill="none" stroke="#f4edff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
            <path d="m9 11l3 3l8-8"/>
            <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>
        </g>`

    const g_path_not_completed = `
        <g id="not_completed">
            <path fill="#f4edff" d="M5 21q-.825 0-1.413-.588T3 19V5q0-.825.588-1.413T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.588 1.413T19 21H5Zm0-2h14V5H5v14Z"/>
        </g>`

    const g_svg = svg_el.querySelector('g');

    if (g_svg.id == "completed"){
        svg_el.innerHTML = g_path_not_completed
    }
    else if (g_svg.id == "not_completed"){
        svg_el.innerHTML = g_path_completed
    }

    span.classList.toggle("line-through");
 
}

async function deleteGoal(event, goalList) {
    const button = event.target;
    const li = button.closest('li');
    const id = li.dataset.id;

    button.closest('li').remove();

    const serverURL = getServerURL(goalList.id, 'delete')

    await fetch(`${serverURL}/${id}`, {
        method: 'DELETE'
    });
    
}