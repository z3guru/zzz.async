/**
 * Let:
 * There are two modules, one module wants to receive data of the other.
 * But the module can't know when the data is available.
 *
 * The module needs to wait unitl the data ia available.
 *
 * This class provides a method to exchange data between two modules.
 */
class Exchanger
{
	async exchange(value, timeout)
	{
		try
		{
			if ( this.peer === undefined )
			{
				return await this._exchangeImpl(value, timeout);
			}
			else
			{
				// resolve exchanging...
				this.exchanged = value;
				this.resolve('exchanged');
				// return peer's value
				var mypeer = this.peer;
				this.peer = undefined;
				return mypeer;
			}
		}
		catch(e)
		{
			throw e;
		}

		return undefined;
	}

	async _exchangeImpl(value, timeout)
	{
		var that = this;
		this.peer = value;
		this.promise = new Promise((resolve, reject) => {
			that.resolve = resolve;
			if ( !isNaN(timeout) ) setTimeout(()=>{ that.peer = undefined; reject(); }, timeout);
		});

		await this.promise;
		return this.exchanged;
	}

	interrupt()
	{
		if ( this.resolve ) this.resolve("interrupted");
	}
}

module.exports = {
	Exchanger:Exchanger
}