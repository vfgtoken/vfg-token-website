        // VFG Complete Promotional System
        class VFGPromotionalSystem {
            constructor() {
                this.isAdmin = false;
                this.adminPassword = "vfgadmin2025";
                this.currentUser = null;
                this.news = this.loadFromStorage('vfg_news') || [];
                this.users = this.loadFromStorage('vfg_users') || [];
                this.settings = this.loadFromStorage('vfg_settings') || {
                    projectName: "VFG Token",
                    launchDate: "2026 Q2",
                    totalMembers: 2847,
                    whitelistSpots: 1284
                };
                
                this.init();
            }

            init() {
                this.setupEventListeners();
                this.renderNews();
                this.updateStats();
                this.loadSampleData();
                this.startLiveUpdates();
            }

            setupEventListeners() {
                // Wallet connection
                document.getElementById('connectWallet').addEventListener('click', () => this.connectWallet());
                
                // Admin system
                document.getElementById('adminLoginBtn').addEventListener('click', () => this.showAdminLogin());
                document.getElementById('confirmAdminLogin').addEventListener('click', () => this.adminLogin());
                document.getElementById('closeAdminModal').addEventListener('click', () => this.hideAdminLogin());
                document.getElementById('adminLogout').addEventListener('click', () => this.adminLogout());
                
                // News management
                document.getElementById('publishNews').addEventListener('click', () => this.publishNews());
                
                // Settings
                document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
                
                // Chat system
                document.getElementById('sendMessage').addEventListener('click', () => this.sendMessage());
                document.getElementById('messageInput').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.sendMessage();
                });
                
                // Admin tabs
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => this.switchAdminTab(e.target.dataset.tab));
                });
                
                // Whitelist form
                document.getElementById('whitelist-form').addEventListener('submit', (e) => {
                    e.preventDefault();
                    document.getElementById('form-success').classList.remove('hidden');
                    e.target.reset();
                    setTimeout(() => {
                        document.getElementById('form-success').classList.add('hidden');
                    }, 5000);
                });
            }

            // Storage system
            loadFromStorage(key) {
                try {
                    return JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    return null;
                }
            }

            saveToStorage(key, data) {
                localStorage.setItem(key, JSON.stringify(data));
            }

            // Wallet system
            async connectWallet() {
                if (typeof window.ethereum !== 'undefined') {
                    try {
                        const accounts = await window.ethereum.request({ 
                            method: 'eth_requestAccounts' 
                        });
                        
                        this.currentUser = accounts[0];
                        const shortAddress = this.currentUser.substring(0, 6) + '...' + this.currentUser.substring(38);
                        
                        // Update UI
                        document.getElementById('walletInfo').classList.remove('hidden');
                        document.getElementById('walletShort').textContent = shortAddress;
                        
                        // Add user to system
                        this.addUser(this.currentUser, shortAddress);
                        
                        // Add welcome message
                        this.addChatMessage('System', `${shortAddress} dołączył do społeczności! 🎉`, 'system');
                        
                    } catch (error) {
                        console.error('Wallet connection failed:', error);
                    }
                } else {
                    alert('Zainstaluj MetaMask aby połączyć portfel!');
                }
            }

            // Admin system
            showAdminLogin() {
                document.getElementById('adminLoginModal').classList.remove('hidden');
            }

            hideAdminLogin() {
                document.getElementById('adminLoginModal').classList.add('hidden');
            }

            adminLogin() {
                const password = document.getElementById('adminPassword').value;
                if (password === this.adminPassword) {
                    this.isAdmin = true;
                    document.getElementById('admin').classList.remove('hidden');
                    document.getElementById('adminNav').classList.remove('hidden');
                    this.hideAdminLogin();
                    this.renderAdminNews();
                    this.renderUsers();
                    this.loadSettings();
                } else {
                    alert('Nieprawidłowe hasło admina!');
                }
            }

            adminLogout() {
                this.isAdmin = false;
                document.getElementById('admin').classList.add('hidden');
                document.getElementById('adminNav').classList.add('hidden');
            }

            // News system
            publishNews() {
                if (!this.isAdmin) return;
                
                const title = document.getElementById('newsTitle').value;
                const content = document.getElementById('newsContent').value;
                
                if (title && content) {
                    const newsItem = {
                        id: Date.now(),
                        title,
                        content,
                        date: new Date().toLocaleDateString('pl-PL'),
                        time: new Date().toLocaleTimeString('pl-PL')
                    };
                    
                    this.news.unshift(newsItem);
                    this.saveToStorage('vfg_news', this.news);
                    this.renderNews();
                    this.renderAdminNews();
                    
                    // Clear form
                    document.getElementById('newsTitle').value = '';
                    document.getElementById('newsContent').value = '';
                    
                    // Add announcement to chat
                    this.addChatMessage('System', `📢 Nowy news: "${title}"`, 'system');
                }
            }

            renderNews() {
                const container = document.getElementById('newsContainer');
                if (!container) return;
                
                container.innerHTML = '';
                
                this.news.forEach(item => {
                    const newsElement = document.createElement('div');
                    newsElement.className = 'glass-card p-6';
                    newsElement.innerHTML = `
                        <h3 class="text-xl font-bold text-yellow-400 mb-2">${item.title}</h3>
                        <p class="text-gray-300 mb-4">${item.content}</p>
                        <div class="flex justify-between items-center text-sm text-gray-400">
                            <span>${item.date} ${item.time}</span>
                        </div>
                    `;
                    container.appendChild(newsElement);
                });
            }

            renderAdminNews() {
                const container = document.getElementById('adminNewsList');
                container.innerHTML = '';
                
                this.news.forEach(item => {
                    const newsElement = document.createElement('div');
                    newsElement.className = 'flex justify-between items-center p-3 bg-gray-800 rounded-xl';
                    newsElement.innerHTML = `
                        <div>
                            <div class="font-semibold text-yellow-400">${item.title}</div>
                            <div class="text-sm text-gray-400">${item.date}</div>
                        </div>
                        <button onclick="vfgSystem.deleteNews(${item.id})" class="text-red-400 hover:text-red-300">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                    container.appendChild(newsElement);
                });
            }

            deleteNews(id) {
                if (!this.isAdmin) return;
                this.news = this.news.filter(item => item.id !== id);
                this.saveToStorage('vfg_news', this.news);
                this.renderNews();
                this.renderAdminNews();
            }

            // User system
            addUser(address, shortAddress) {
                const existingUser = this.users.find(u => u.address === address);
                if (!existingUser) {
                    this.users.push({
                        address,
                        shortAddress,
                        joined: new Date().toLocaleDateString('pl-PL'),
                        messages: 0
                    });
                    this.saveToStorage('vfg_users', this.users);
                    this.updateStats();
                }
            }

            renderUsers() {
                const container = document.getElementById('userList');
                container.innerHTML = '';
                
                this.users.forEach(user => {
                    const userElement = document.createElement('div');
                    userElement.className = 'flex justify-between items-center p-3 bg-gray-800 rounded-xl';
                    userElement.innerHTML = `
                        <div class="flex items-center space-x-3">
                            <div class="w-3 h-3 bg-yellow-400 rounded-full"></div>
                            <span class="text-yellow-400">${user.shortAddress}</span>
                        </div>
                        <span class="text-gray-400 text-sm">Dołączył: ${user.joined}</span>
                    `;
                    container.appendChild(userElement);
                });
            }

            // Chat system
            sendMessage() {
                if (!this.currentUser) {
                    alert('Najpierw połącz portfel aby pisać na chatcie!');
                    return;
                }

                const input = document.getElementById('messageInput');
                const message = input.value.trim();
                
                if (message) {
                    const shortAddress = this.currentUser.substring(0, 6) + '...' + this.currentUser.substring(38);
                    this.addChatMessage(shortAddress, message, 'self');
                    input.value = '';
                    
                    // Update user message count
                    const user = this.users.find(u => u.address === this.currentUser);
                    if (user) user.messages++;
                    
                    // Simulate community responses
                    setTimeout(() => {
                        this.generateCommunityResponse(message);
                    }, 1000 + Math.random() * 2000);
                }
            }

            addChatMessage(user, message, type) {
                const container = document.getElementById('chatMessages');
                const messageDiv = document.createElement('div');
                
                messageDiv.className = `p-3 rounded-xl max-w-xs ${
                    type === 'self' ? 'message-self ml-auto' : 
                    type === 'system' ? 'bg-blue-500/20 text-blue-300 text-center' : 'message-other'
                }`;
                
                if (type !== 'system') {
                    messageDiv.innerHTML = `
                        <div class="font-semibold text-sm ${type === 'self' ? 'text-gray-900' : 'text-yellow-400'}">
                            ${user}
                        </div>
                        <div class="mt-1 ${type === 'self' ? 'text-gray-900' : 'text-white'}">
                            ${message}
                        </div>
                        <div class="text-xs mt-1 ${type === 'self' ? 'text-gray-700' : 'text-gray-400'}">
                            teraz
                        </div>
                    `;
                } else {
                    messageDiv.textContent = message;
                }
                
                container.appendChild(messageDiv);
                container.scrollTop = container.scrollHeight;
            }

            generateCommunityResponse(triggerMessage) {
                const responses = {
                    'price': 'Nie mogę się doczekać premiery tokena! Obecna przewidywana cena jest bardzo atrakcyjna 🚀',
                    'ama': 'Sesje AMA były niesamowite! Tak dużo transparentności od zespołu 📅',
                    'when': 'Premiera za 6 miesięcy - idealny czas na budowanie społeczności! 💰',
                    'team': 'Doświadczenie zespołu w krypto i motoryzacji jest imponujące! 👥',
                    'ecosystem': 'Ekosystem VFG wygląda kompleksowo - Pay, Protect, Tune, wszystko! 🛠️',
                    'default': [
                        'Ten projekt ma ogromny potencjał! 🚀',
                        'Społeczność rośnie tak szybko! 🌱',
                        'Uwielbiam transparentność zespołu! 👍',
                        '6-miesięczne budowanie jest mądre - tworzy prawdziwy organiczny wzrost 📈',
                        'Połączenie motoryzacji + krypto jest genialne! 🚗💨'
                    ]
                };

                let response = responses.default[Math.floor(Math.random() * responses.default.length)];
                
                Object.keys(responses).forEach(key => {
                    if (triggerMessage.toLowerCase().includes(key) && key !== 'default') {
                        response = responses[key];
                    }
                });

                const communityMembers = ['CryptoCarEnthusiast', 'AutoTechInvestor', 'BlockchainDriver', 'VFGSupporter', 'FutureHolder'];
                const randomUser = communityMembers[Math.floor(Math.random() * communityMembers.length)];
                
                this.addChatMessage(randomUser, response, 'other');
            }

            // Settings system
            loadSettings() {
                document.getElementById('projectName').value = this.settings.projectName;
                document.getElementById('launchDate').value = this.settings.launchDate;
            }

            saveSettings() {
                if (!this.isAdmin) return;
                
                this.settings.projectName = document.getElementById('projectName').value;
                this.settings.launchDate = document.getElementById('launchDate').value;
                
                this.saveToStorage('vfg_settings', this.settings);
                this.updateStats();
                
                alert('Ustawienia projektu zaktualizowane pomyślnie!');
            }

            // Stats system
            updateStats() {
                document.getElementById('statsMembers').textContent = this.settings.totalMembers.toLocaleString();
                document.getElementById('statsOnline').textContent = Math.floor(50 + Math.random() * 100);
                document.getElementById('onlineCount').textContent = Math.floor(50 + Math.random() * 100);
            }

            // Admin tabs
            switchAdminTab(tabName) {
                // Update tab buttons
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('tab-active');
                });
                event.target.classList.add('tab-active');
                
                // Show selected tab
                document.querySelectorAll('.admin-tab').forEach(tab => {
                    tab.classList.add('hidden');
                });
                document.getElementById(tabName).classList.remove('hidden');
            }

            // Live updates and community simulation
            startLiveUpdates() {
                // Update stats periodically
                setInterval(() => {
                    this.updateStats();
                }, 30000);

                // Simulate organic community activity
                setInterval(() => {
                    if (Math.random() > 0.4) {
                        const messages = [
                            'Kiedy następne community AMA?',
                            '6-miesięczny roadmap wygląda solidnie!',
                            'Właśnie dołączyłem do whitelist - podekscytowany premierą!',
                            'Use case\'y motoryzacyjne są rewolucyjne',
                            'Ilu członków zespołu pracuje nad tym projektem?',
                            'Wzrost społeczności jest imponujący!',
                            'Co wyróżnia VFG spośród innych tokenów automotive?',
                            'Nie mogę się doczekać aplikacji mobilnej!',
                            'Tokenomics wygląda przemyślanie',
                            'Kiedy smart contract będzie audytowany?'
                        ];
                        const users = ['CryptoEnthusiast', 'AutoInvestor', 'TechGuru', 'BlockchainFan', 'EarlySupporter'];
                        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                        const randomUser = users[Math.floor(Math.random() * users.length)];
                        
                        this.addChatMessage(randomUser, randomMessage, 'other');
                    }
                }, 12000);

                // Simulate organic community growth
                setInterval(() => {
                    if (Math.random() > 0.7) {
                        this.settings.totalMembers++;
                        this.settings.whitelistSpots = Math.max(0, this.settings.whitelistSpots - 1);
                        this.updateStats();
                        this.saveToStorage('vfg_settings', this.settings);
                    }
                }, 45000);
            }

            // Sample data for demonstration
            loadSampleData() {
                if (this.news.length === 0) {
                    this.news = [
                        {
                            id: 1,
                            title: 'VFG Token - Start Budowy Społeczności!',
                            content: 'Z radością ogłaszamy rozpoczęcie fazy budowy społeczności przed premierą tokena w 2026 Q2. Dołącz do nas w rewolucjonizowaniu automotive crypto!',
                            date: new Date().toLocaleDateString('pl-PL'),
                            time: new Date().toLocaleTimeString('pl-PL')
                        }
                    ];
                    this.saveToStorage('vfg_news', this.news);
                }

                // Load sample activity feed
                this.loadSampleActivity();
            }

            loadSampleActivity() {
                const activityContainer = document.getElementById('activityFeed');
                if (!activityContainer) return;
                
                const activities = [
                    { user: 'CryptoMax', action: 'dołączył do whitelist', time: '2 min temu' },
                    { user: 'AnnaTrader', action: 'dołączył do społeczności', time: '5 min temu' },
                    { user: 'BlockChainPro', action: 'udostępnił na Twitterze', time: '8 min temu' },
                    { user: 'AutoEnthusiast', action: 'zaprosił 3 znajomych', time: '12 min temu' }
                ];

                activities.forEach(activity => {
                    const activityElement = document.createElement('div');
                    activityElement.className = 'flex items-center justify-between p-2 bg-gray-800/50 rounded-lg';
                    activityElement.innerHTML = `
                        <div class="flex items-center space-x-2">
                            <span class="text-yellow-400 font-semibold">${activity.user}</span>
                            <span class="text-gray-400">${activity.action}</span>
                        </div>
                        <span class="text-gray-500 text-sm">${activity.time}</span>
                    `;
                    activityContainer.appendChild(activityElement);
                });
            }
        }

        // Initialize the complete promotional system
        let vfgSystem;
        document.addEventListener('DOMContentLoaded', function() {
            vfgSystem = new VFGPromotionalSystem();
            
            // Płynne przewijanie do sekcji
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    if(targetId === '#') return;
                    const targetElement = document.querySelector(targetId);
                    if(targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                });
            });

            const mobileMenuButton = document.getElementById('mobileMenuButton');
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenuButton && mobileMenu) {
                mobileMenuButton.addEventListener('click', () => {
                    const isHidden = mobileMenu.classList.contains('hidden');
                    mobileMenu.classList.toggle('hidden');
                    mobileMenuButton.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
                });

                mobileMenu.querySelectorAll('a').forEach((link) => {
                    link.addEventListener('click', () => {
                        mobileMenu.classList.add('hidden');
                        mobileMenuButton.setAttribute('aria-expanded', 'false');
                    });
                });
            }
        });
