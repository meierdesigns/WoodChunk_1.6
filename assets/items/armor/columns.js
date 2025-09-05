export default {
    category: 'armor',
    columns: {
        icon: { 
            enabled: true, 
            label: 'Icon', 
            width: '50px',
            sortable: false,
            order: 1
        },
        name: { 
            enabled: true, 
            label: 'Name', 
            width: '200px',
            sortable: true,
            order: 2
        },
        level: { 
            enabled: true, 
            label: 'Level', 
            width: '80px',
            sortable: true,
            order: 3
        },
        rarity: { 
            enabled: true, 
            label: 'Seltenheit', 
            width: '120px',
            sortable: true,
            order: 4
        },
        value: { 
            enabled: true, 
            label: 'Wert', 
            width: '100px',
            sortable: true,
            order: 5
        },
        actions: { 
            enabled: true, 
            label: 'Aktionen', 
            width: '120px',
            sortable: false,
            order: 6
        }
    },
    defaultSort: {
        column: 'level',
        direction: 'asc'
    }
};
