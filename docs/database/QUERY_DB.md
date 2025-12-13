// run the migraion

npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d src/data-source.ts




// List all matches

```
PGPASSWORD=password psql -h localhost -p 5433 -U admin -d razmena_vrtica -c "
SELECT
    mg.id as match_group_id,
    mg.status,
    mg.created_at,
    mp.id as participant_id,
    mp.child_id,
    mp.next_child_id,
    mp.has_accepted,
    c.name as child_name,
    c.group as child_age_group,
    kg.name as current_kindergarten,
    nc.name as next_child_name
FROM match_group mg
LEFT JOIN match_participant mp ON mg.id = mp.match_group_id
LEFT JOIN child c ON mp.child_id = c.id
LEFT JOIN child nc ON mp.next_child_id = nc.id
LEFT JOIN kindergarten kg ON c.current_kindergarten_id = kg.id
ORDER BY mg.created_at DESC, mg.id, mp.id;
"
```
