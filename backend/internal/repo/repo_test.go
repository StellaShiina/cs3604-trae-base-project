package repo

import (
    "testing"
    "time"

    "cs3604/backend/internal/config"
    "cs3604/backend/internal/db"
    "github.com/stretchr/testify/require"
)

func TestRepoDatabaseFeatures(t *testing.T) {
    cfg := config.LoadDB()
    gdb, err := db.Open(cfg.DSN())
    require.NoError(t, err)
    r := New(gdb)

    exts, err := r.Extensions()
    require.NoError(t, err)
    require.Contains(t, exts, "citext")
    require.Contains(t, exts, "pg_trgm")
    require.Contains(t, exts, "pgcrypto")

    ttypes, err := r.EnumValues("train_type_enum")
    require.NoError(t, err)
    require.Contains(t, ttypes, "D")

    sts, err := r.StationsByCodes([]string{"BJP", "SHH"})
    require.NoError(t, err)
    require.Len(t, sts, 2)
    var bjp, shh string
    for _, s := range sts { if s.Code == "BJP" { bjp = s.ID } else if s.Code == "SHH" { shh = s.ID } }
    require.NotEmpty(t, bjp)
    require.NotEmpty(t, shh)

    items, err := r.SearchView(bjp, shh, time.Now(), "00:00", "24:00", false)
    require.NoError(t, err)
    require.GreaterOrEqual(t, len(items), 1)

    svcID, segID, err := r.ServiceAndSegment("D5", time.Now(), bjp, shh)
    require.NoError(t, err)
    leftBefore, err := r.InventoryLeft(segID, "second")
    require.NoError(t, err)

    uid, err := r.CreateUser("test_user_repo", "test_user_repo@example.com", "dummyhash")
    require.NoError(t, err)
    defer r.DeleteUser(uid)

    pid, err := r.CreatePreorder(uid, svcID, segID, bjp, shh, "second", time.Now().Add(10*time.Minute))
    require.NoError(t, err)
    require.NotEmpty(t, pid)
    leftAfter, err := r.InventoryLeft(segID, "second")
    require.NoError(t, err)
    require.Equal(t, leftBefore-1, leftAfter)

    err = r.UpdatePreorderStatus(pid, "canceled")
    require.NoError(t, err)
    leftFinal, err := r.InventoryLeft(segID, "second")
    require.NoError(t, err)
    require.Equal(t, leftBefore, leftFinal)

    err = r.InsertTrainService("D5", time.Now().Add(20*24*time.Hour))
    require.Error(t, err)
}