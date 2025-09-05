export default {
    category: 'quest',
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
        value: { 
            enabled: true, 
            label: 'Wert', 
            width: '100px',
            sortable: true,
            order: 3
        },
        actions: { 
            enabled: true, 
            label: 'Aktionen', 
            width: '120px',
            sortable: false,
            order: 4
        }
    },
    defaultSort: {
        column: 'name',
        direction: 'asc'
    }
};
