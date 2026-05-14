const dailyGoalsList =
    document.querySelector('#dailyGoalsList');
const weeklyGoalsList =
    document.querySelector('#weeklyGoalsList');


if(weeklyGoalsList) {
    const weekly_goal_input = 
        document.querySelector('#weekly_goals_input');

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
}

if(dailyGoalsList) {
    const daily_goal_input = 
        document.querySelector('#daily_goals_input');

    daily_goal_input.addEventListener('keydown', async (event) => {
        if (event.key !== 'Enter') 
            return;
        newGoal(daily_goal_input, dailyGoalsList)
    });
    dailyGoalsList.addEventListener('click', async (event) => {
        if (!event.target.classList.contains('deleteDailyGoal'))
            return;
        deleteGoal(event, dailyGoalsList);
    });
}

function getServerURL(goal_type, action){
    if (goal_type == 'weeklyGoalsList') {
        if (action == 'new') {
            return '/notes/weekly_goals/new'
        }
        if (action == 'delete') {
            return '/notes/weekly_goals'
        }
    }
    if (goal_type == 'dailyGoalsList') {
        if (action == 'new') {
            return '/notes/daily_goals/new'
        }
        if (action == 'delete') {
            return '/notes/daily_goals'
        }
    }
}

function createLi(data, goalList) {
    const span =
        document.createElement('span');
    span.className = 
        'group-has-[a:hover]:line-through';
    span.textContent =
        data.weekly_goals || data.daily_goals;
    
    const a =
        document.createElement('a');
    a.className = goalList.querySelector('a').className;
    a.textContent =' x'

    const li =
            document.createElement('li');
    li.className =
        'group font-semibold text-2xl text-wrap tracking-widest text-branco';
    li.dataset.id = data.id;

    li.appendChild(span)
    li.appendChild(a)

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