import re

with open('../backend-rust/src/api/mod.rs', 'r') as f:
    lines = f.readlines()

out = []
routers = {
    'public': [],
    'admin': [],
    'management': [],
    'account': [],
    'market': []
}
misc_routes = []

in_router = False
for line in lines:
    if 'Router::new()' in line and '.route(' not in line:
        in_router = True
        continue
        
    if in_router:
        m = re.search(r'\.route\("([^"]+)", (get|post|put|delete|patch)\(([a-zA-Z0-9_]+)\)\)', line)
        if m:
            route_path = m.group(1)
            method = m.group(2)
            fn_name = m.group(3)
            
            # extract category
            if 'public' in fn_name: category = 'public'
            elif 'admin' in fn_name: category = 'admin'
            elif 'management' in fn_name: category = 'management'
            elif 'account' in fn_name: category = 'account'
            elif 'market' in fn_name and 'data' not in fn_name: category = 'market'
            else:
                misc_routes.append(line.strip())
                continue
                
            routers[category].append(line.strip())
        elif 'with_state' in line:
            in_router = False
            # construct new router
            out.append('        let public_router = Router::new()\n')
            for r in routers['public']: out.append(f'            {r}\n')
            out.append('            ;\n\n')
            
            out.append('        let admin_router = Router::new()\n')
            for r in routers['admin']: out.append(f'            {r}\n')
            out.append('            ;\n\n')
            
            out.append('        let management_router = Router::new()\n')
            for r in routers['management']: out.append(f'            {r}\n')
            out.append('            ;\n\n')
            
            out.append('        let account_router = Router::new()\n')
            for r in routers['account']: out.append(f'            {r}\n')
            out.append('            ;\n\n')
            
            out.append('        let market_router = Router::new()\n')
            for r in routers['market']: out.append(f'            {r}\n')
            out.append('            ;\n\n')
            
            out.append('        Router::new()\n')
            for r in misc_routes: out.append(f'            {r}\n')
            out.append('            .nest("/public", public_router)\n')
            out.append('            .nest("/admin", admin_router)\n')
            out.append('            .nest("/management", management_router)\n')
            out.append('            .nest("/account", account_router)\n')
            out.append('            .nest("/market", market_router)\n')
            out.append(f'            {line}')
        continue
        
    out.append(line)

with open('../backend-rust/src/api/mod.rs', 'w') as f:
    f.writelines(out)
