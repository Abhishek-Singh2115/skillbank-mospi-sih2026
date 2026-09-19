import asyncio

async def main():
    from backend.database import db_manager
    await db_manager.connect()
    col = db_manager.get_collection("users")

    filt = {"email": "thatabhisheksingh@gmail.com"}
    update_op = {"$set": {"role": "admin"}}

    result = await col.update_one(filt, update_op)
    print("matched_count  :", result.matched_count)
    print("modified_count :", result.modified_count)

    doc = await col.find_one(filt)
    if doc:
        print()
        print("--- Saved record ---")
        print("_id   :", doc.get("_id"))
        print("name  :", doc.get("name"))
        print("email :", doc.get("email"))
        print("role  :", doc.get("role"))
    else:
        print("ERROR: user not found - sign in first.")

asyncio.run(main())
