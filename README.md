# cubingtw-auto-fill

自動報名 https://cubing-tw.net/ 的比賽

## How to (As a User)

### Requirements

- Node.js 18+

### Steps

1. Clone this repository:
    ```bash
    git clone https://github.com/speedcubing-top/cubingtw-auto-fill.git
    cd cubingtw-auto-fill
    ```

2. Install dependencies:
    ```bash
    npm install
    npx playwright install chromium
    ```
3. Configuration File:
    ```bash
    cp config.json.example config.json
    ```
   
    `event`: 
    - for instance: `https://cubing-tw.net/event/2018TaiwanChampionship` -> `2018TaiwanChampionship`

    `autosubmit_delay` (optional): seconds to wait after the preview shows up before clicking `報名送出 Send！` automatically.
    - `-1` (default): disabled, click Send yourself
    - `0`: submit immediately

	Events are not configurable: the script registers for one event only, the first one available in the form, in this order:  
	`33`, `22`, `44`, `55`, `66`, `77`, `3bld`, `3fmc`, `3oh`, `clock`, `mega`, `pyra`, `skewb`, `sq1`, `4bld`, `5bld`, `mbld`

	**Competitors with a WCA ID**
	```json
	{
	  "event": "2018TaiwanChampionship",
	  "autosubmit_delay": -1,
	  "competitor": {
	    "wcaid": "2003BRUCH01",
	    "year": "1970",
	    "month": "1",
	    "day": "1",
	    "email": "username@example.com"
	  }
	}
	```

	**First-time competitors**
	```json
	{
	  "event": "2018TaiwanChampionship",
	  "autosubmit_delay": -1,
	  "competitor": {
	    "new": true,
	    "local_name": "王小名",
	    "english_name": "Xiao-Ming Wang",
	    "gender": "male",
	    "country": "Taiwan",
	    "year": "1970",
	    "month": "1",
	    "day": "1",
	    "email": "username@example.com"
	  }
	}
	```

4. Run the script:  
    ```bash
    node cubingtw-auto-fill.js
    ```
    The script reads the registration start time from the event's `/registration` page, waits until 10 seconds before it, then keeps reloading until registration opens.  
    If the page shows a reopen date, its start time is used instead.


