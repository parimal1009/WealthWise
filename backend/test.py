# ---- Your full stock list here ----
stocks=[
    # --- Large Cap (0–99) ---
    'RELIANCE','HDFCBANK','TCS','BHARTIARTL','ICICIBANK','INFY','SBIN',
    'HINDUNILVR','BAJFINANCE','ITC','LICI','LT','HCLTECH','SUNPHARMA',
    'KOTAKBANK','MARUTI','M&M','AXISBANK','ULTRACEMCO','NTPC','ONGC',
    'BAJAJFINSV','TITAN','WIPRO','HAL','ADANIENT','POWERGRID','ADANIPORTS',
    'DMART','TATAMOTORS','JSWSTEEL','COALINDIA','BAJAJ-AUTO','BEL','ETERNAL',
    'NESTLEIND','ASIANPAINT','ADANIPOWER','TRENT','INDIGO','ЮС','HINDZINC',
    'DLF','TATASTEEL','VBL','IRFC','GRASIM','VEDL','JIOFIN','DIVISLAB',
    'SBILIFE','TECHM','LTIM','ADANIGREEN','PIDILITIND','HDFCLIFE','HYUNDAI',
    'EICHERMOT','HINDALCO','BAJAJHLDNG','PFC','AMBUJACEM','LODHA','BPCL',
    'BRITANNIA','CHOLAF IN','ABB','TVSMOTOR','TATAPOWER','CIPLA','GODREJCP',
    'BANKBARODA','GAIL','SHRIRAMFIN','PNB','RECLTD','INDHOTEL','SIEMENS',
    'SOLARINDS','TORNTPHARM','MAZDOCK','MAXHEALTH','UNITDSPR','SHREECEM',
    'TATACONSUM','DRREDDY','MANKIND','BAJAJHFL','ENRIN','ADANIENSOL',
    'MOTHERSON','CGPOWER','APOLLOHOSP','HAVELLS','INDUSTOWER','UNIONBANK',
    'NAUKRI','LUPIN','ZYDUSLIFE','JINDALSTEL',
    # Insert NIFTYBEES here as Large Cap
    'NIFTYBEES',
    
    # --- Mid Cap (100–249) ---
    'HDFCAMC','ICICIGI','MUTHOOTFIN','DIXON','NTPCGREEN','JSWENERGY',
    'CANBK','IDBI','PERSISTENT','DABUR','ICICIPRULI','BOSCHLTD','MARICO',
    'POLYCAB','SWIGGY','SRF','GMRAIRPORT','CUMMINSIND','NHPC','SBICARD',
    'IOB','HEROMOTOCO','RVNL','SUZLON','HINDPETRO','POLICYBZR','BHEL','OFSS',
    'BHARTIHEXA','INDIANB','WAAREEENER','TORNTPOWER','GICRE','ATGL','COLPAL',
    'LLOYDSME','AUROPHARMA','OIL','INDUSINDBK','GODREJPROP','PATANJALI',
    'ASHOKLEY','IDEA','ABBOTINDIA','OBEROIRLTY','POWERINDIA','COROMANDEL',
    'BERGEPAINT','JSWINFRA','IRCTC','ALKEM','PRESTIGE','NMDC','YESBANK',
    'PHOENIXLTD','TINDIA','BHARATFORG','UNOMINDA','SCHAEFFLER','LINDEINDIA',
    'COFORGE','PIIND','KALYANKJIL','UBL','FACT','SUNDARMFIN','PAYTM','BDL',
    'MRF','NYKAA','VMM','JSL','FORTIS','UPL','ABCAPITAL','BALKRISIND',
    'PAGEIND','BANKINDIA','LTTS','MPHASIS','SUPREMEIND','SAIL','FEDERALBNK',
    'IREDA','AUBANK',
    # Insert IDFCFIRSTB here as Mid Cap
    'IDFCFIRSTB',
    
    # --- Small Cap (250+) ---
    'HEXT','PETRONET','GLAXO','PREMIERENE','TATACOMM','PGHH','GVTD',
    'VOLTAS','JUBLFOOD','APLAPOLLO','CONCOR','MOTILALOFS','HUDCO','UCOBANK',
    'MFSL','COCHINSHIP','BIOCON','GLENMARK','FLUOROCHEM','THERMAX',
    'NAM-INDIA','360ONE','LTF','ITCHOTELS','JKCEMENT','MAHABANK','BLUESTARCO',
    'ASTRAL','CENTRALBK','SJVN','TATAELXSI','GODREJIND','CRISIL','ESCORTS',
    'IPCALAB','ACC','KPITTECH','DALBHARAT','GODFRYPHLP','AWL','M&MFIN',
    'KAYNES','KPRMILL','NATIONALUM','KEI','AJANTPHARM','NH','HONAUT','3MINDIA',
    'LAURUSLABS','CHOLAHLDNG','AIL','NLCINDIA','EXIDEIND','RADICO','LICHSGFIN',
    'TATAINVEST','SONACOMS','METROBRAND','MEDANTA','AIAENG','MCX','GUJGASLTD',
    'COHANCE','IRB','TATATECH','ENDURANCE','ITI','APARINDS','GILLETTE',
    'PPLPHARMA','NIACL','GODIGIT','SYNGENE','APOLLOTYRE','IKS','DEEPAKNTR',
    'ISEC','IGL','AEGISVOPAK','AEGISLOG','POONAWALLA','BRIGADE','NBCC',
    'JBCHEPHARM','GLAND','PSB','SUMICHEM','EMAMILTD','OLAELEC','JYOTICNC',
    'BANDHANBNK','ASTERDM','KIMS','FSL','SUNTV','MSUMI','PNBHOUSING',
    'STARHEALTH','POLYMED','PGEL','ABREL','MRPL','DELHIVERY','PEL','ZFCVINDIA',
    'HSCL','WOCKPHARMA','JSWHL','CHAMBLFERT','EIHOTEL','SHYAMMETL','LALPATHLAB',
    'AFFLE','BAYERCROP','ANGELONE','TATACHEM','CROMPTON','HINDCOPPER','GRSE',
    'NUVAMA','AMBER','RAMCOCEM','INOXWIND','EMCURE','KEC','PFIZER','TIMKEN',
    'MANYAVAR','WELCORP','FIVESTAR','HATSUN','PTCIL','FIRSTCRY','SAGILITY',
    'NAVINFLUOR','DEVYANI','SUNDRMFAST',
    # Insert missing small caps
    'ONEPOINT-BE','VIKASLIFE','VIVANTA'
]

# Remove nan entries and normalize to uppercase
stocks = [s.upper() for s in stocks if str(s).lower() != 'nan']

# --- Step 1: Get Cap Category by Stock Name ---
def get_cap_category(stock_name):
    stock_name = stock_name.upper()
    if stock_name in stocks:
        idx = stocks.index(stock_name)
        if 0 <= idx <= 99:
            return "Large Cap"
        elif 100 <= idx <= 249:
            return "Mid Cap"
        else:
            return "Small Cap"
    return None  # not found

# --- Step 2: Market Cap Risk Score ---
cap_scores = {"Large Cap": 1, "Mid Cap": 2, "Small Cap": 3}

def calc_market_cap_score(holdings):
    """
    holdings: dict {stock_symbol: holding_value}
    Returns RiskScoreA based on market cap exposure.
    """
    total_stock_value = sum(holdings.values())
    if total_stock_value == 0:
        return 0  # no stocks
    
    weights = {"Large Cap": 0, "Mid Cap": 0, "Small Cap": 0}
    
    for stock, value in holdings.items():
        cap = get_cap_category(stock)
        if cap:
            weights[cap] += value
    
    # Convert to proportions
    for cap in weights:
        weights[cap] = weights[cap] / total_stock_value if total_stock_value > 0 else 0
    
    # Calculate weighted score
    risk_score = sum(weights[cap] * cap_scores[cap] for cap in weights)
    return risk_score

# --- Step 3: FD-to-Stocks Ratio Risk Score ---
def calc_fd_score(fd_value, stock_value):
    total = fd_value + stock_value
    if total == 0:
        return 0  # no assets
    
    safety_ratio = fd_value / total  # higher ratio = more conservative
    
    # Map to score: 1 (very conservative) to 3 (very aggressive)
    if safety_ratio > 0.75:
        return 1.0
    elif 0.50 <= safety_ratio <= 0.75:
        return 1.5
    elif 0.25 <= safety_ratio < 0.50:
        return 2.0
    else:
        return 3.0

# --- Step 4: Risk Tolerance Buckets ---
def risk_tolerance_bucket(score):
    score = round(score, 2)  # round to avoid floating-point issues
    if 1.00 <= score <= 1.50:
        return "Conservative (Low Risk)"
    elif 1.51 <= score <= 2.50:
        return "Moderate"
    elif 2.51 <= score <= 3.00:
        return "Aggressive (High Risk)"
    return "Unknown"


# --- Step 5: Mutual Fund Score ---
def calc_mf_score(mf_value, stock_value, fd_value):
    total = mf_value + stock_value + fd_value
    if total == 0:
        return 0
    
    # Risk score of MF is fixed between FD and Stocks
    mf_score = 1.8
    
    weight = mf_value / total
    return mf_score * weight

# --- Step 6: Updated Final Risk Calculation ---
def calc_final_risk(fd_value, holdings, mf_value=0):
    stock_value = sum(holdings.values())
    total_assets = fd_value + stock_value + mf_value
    
    if total_assets == 0:
        return 0, "No Investments"
    
    # Risk A: Stock market cap based
    risk_a = calc_market_cap_score(holdings)
    
    # Risk B: FD vs Stock ratio
    risk_b = calc_fd_score(fd_value, stock_value)
    
    # Risk C: Mutual Fund
    risk_c = calc_mf_score(mf_value, stock_value, fd_value)
    
    # Weighted average based on asset proportions
    weights = {
        "stocks": stock_value / total_assets if total_assets > 0 else 0,
        "fd": fd_value / total_assets if total_assets > 0 else 0,
        "mf": mf_value / total_assets if total_assets > 0 else 0,
    }
    
    final_score = (
        risk_a * weights["stocks"] +
        risk_b * weights["fd"] +
        risk_c  # already weighted
    )
    
    return final_score, risk_tolerance_bucket(final_score)

# ---- Example Usage ----
if __name__ == "__main__":
    # Example: user portfolio
    holdings = {
        "IDFCFIRSTB": 356.45000000000005,
        "NIFTYBEES": 112755.84,
        "ONEPOINT-BE": 141.3,
        "SUZLON": 238.36,
        "TATASTEEL": 159.23,
        "VIKASLIFE": 17.36,
        "VIVANTA": 41.25
    }
    fd_value = 200000
    mf_value = 0  # Mutual Funds investment
    
    score, bucket = calc_final_risk(fd_value, holdings, mf_value)
    print(f"Final Risk Score: {score:.2f}")
    print(f"Risk Tolerance: {bucket}")
