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
3. Update the Configuration File (optional if using command-line arguments):
   - You can either use a `config.json` file **or** provide all settings via command-line arguments.
   - **Cannot use both at the same time.**

4. Run the script:  
   Using config file
   ```bash
   node cubingtw-auto-fill.js --config config.json
   ```
   Using command-line arguments
   ```bash
   node cubingtw-auto-fill.js \
     --event 2018TaiwanChampionship \
     --wcaid 2003BRUCH01 \
     --year 1970 \
     --month 1 \
     --day 1 \
     --email username@example.com
   ```
   The script reads the registration start time (報名時間) from the event's `/registration` page, waits until 10 seconds before it, then keeps reloading until registration opens.

### Configuration

`event`: 
- for instance: `https://cubing-tw.net/event/2018TaiwanChampionship` -> `2018TaiwanChampionship`

Events are not configurable: the script registers for one event only, the first one available in the form, in this order:  
`33`, `22`, `44`, `55`, `66`, `77`, `3bld`, `3fmc`, `3oh`, `clock`, `mega`, `pyra`, `skewb`, `sq1`, `4bld`, `5bld`, `mbld`

**Competitors with a WCA ID**
```json
{
  "event": "2018TaiwanChampionship",
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
