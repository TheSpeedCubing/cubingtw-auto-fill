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

2. Update the Configuration File:
   (please see the **Configuration** below)
   
2. Install dependencies:
   ```bash
   npm install
   npx playwright install chromium
   ```
   
3. Run the script:
   ```bash
   node cubing-tw-auto-fill.js 
   ```

### Configuration

`event`: 
- 例: `https://cubing-tw.net/event/2018TaiwanChampionship` -> `2018TaiwanChampionship`

`competitor.event`: 
- 要報名的項目 (只能選一個)
- 如果比賽有3x3x3，可以先選 `33`，之後再去繳費頁面更改項目

**有 WCAID 的選手**
```json
{
  "event": "2018TaiwanChampionship",
  "competitor": {
    "wcaid": "2003BRUCH01",
    "year": "1970",
    "month": "1",
    "day": "1",
    "email": "username@example.com",
    "event": "33"
  }
}
```

**首次參賽的選手**
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
    "email": "username@example.com",
    "event": "33"
  }
}
```